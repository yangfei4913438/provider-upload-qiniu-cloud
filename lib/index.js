'use strict';
const qiniu = require("qiniu")

// 机房区域配置
const ZoneMap = {
  "Zone_z0": qiniu.zone.Zone_z0,  // 华东
  "Zone_z1": qiniu.zone.Zone_z1,  // 华北
  "Zone_z2": qiniu.zone.Zone_z2,  // 华南
  "Zone_na0": qiniu.zone.Zone_na0, // 北美
  "Zone_as0": qiniu.zone.Zone_as0, // 东南亚
}

module.exports = {
  provider: 'qiniu',
  name: 'Qiniu Storage Service',
  auth: {
    accessKey: {
      label: 'Access API Token',
      type: 'text'
    },
    secretKey: {
      label: 'Secret Access Token',
      type: 'text'
    },
    prefix: {
      label: 'Prefix in your qiniu storage key',
      type: 'text'
    },
    zone: {
      label: 'Region',
      type: 'enum',
      values: Object.keys(ZoneMap)
    },
    bucket: {
      label: 'Bucket',
      type: 'text'
    },
    publicBucketDomain: {
      label: 'Your domain link to qiniu',  // example: http://if-pbl.qiniudn.com
      type: 'text'
    },
    https: {
      label: 'Domain with or without https',
      type: 'boolean'
    },
    cdn: {
      label: 'Whether to use cdn acceleration when uploading',
      type: 'boolean'
    }
  },
  init(qiniuConfig) {
    // init your provider if necessary
    const prefix = qiniuConfig.prefix;
    const bucket = qiniuConfig.bucket
    const publicBucketDomain = qiniuConfig.publicBucketDomain;

    // 实例化配置对象
    const zoneConfig = new qiniu.conf.Config()
    // 默认使用华东区机房
    zoneConfig.zone = ZoneMap[qiniuConfig.zone] || qiniu.zone.Zone_z0
    // 域名是否使用https
    zoneConfig.useHttpsDomain = qiniuConfig.https;
    // 上传是否使用cdn加速
    zoneConfig.useCdnDomain = qiniuConfig.cdn;

    // 定义鉴权对象mac
    const mac = new qiniu.auth.digest.Mac(qiniuConfig.accessKey, qiniuConfig.secretKey)
    // 桶管理对象
    const bucketManager = new qiniu.rs.BucketManager(mac, zoneConfig);

    // 生成上传对象
    const formUploader = new qiniu.form_up.FormUploader(zoneConfig)

    const putExtra = new qiniu.form_up.PutExtra()


    return {
      upload(file) {
        return new Promise((resolve, reject) => {
          // 定义key
          let key = `${prefix}/${file.hash}${file.ext}`

          // 上传凭证选项
          const uploadOptions = {
            scope: `${bucket}:${key}`,
          }
          // 定义上传凭证
          const putPolicy = new qiniu.rs.PutPolicy(uploadOptions)
          // 获取上传 Token
          const uploadToken = putPolicy.uploadToken(mac)

          // 文件上传
          formUploader.put(uploadToken, key, new Buffer(file.buffer, 'binary'), putExtra, (respErr, respBody, respInfo) => {
            if (respErr) {
              return reject(respErr)
            }
            if (respInfo.statusCode === 200) {
              // 公开空间访问链接
              file.url = bucketManager.publicDownloadUrl(publicBucketDomain, key);
              return resolve()
            } else {
              return reject(respErr)
            }
          })
        });
      },
      uploadStream(file) {
        return new Promise((resolve, reject) => {
           // 定义key
          let key = `${prefix}/${file.hash}${file.ext}`
          // 上传凭证选项
          const uploadOptions = {
            scope: `${bucket}:${key}`,
          }
          // 定义上传凭证
          const putPolicy = new qiniu.rs.PutPolicy(uploadOptions)
          // 获取上传 Token
          const uploadToken = putPolicy.uploadToken(mac)

          // 文件上传
          formUploader.putStream(uploadToken, key, file.stream, putExtra, (respErr, respBody, respInfo) => {
            if (respErr) {
              throw respErr;
            }
            if (respInfo.statusCode === 200) {
              // 公开空间访问链接
              file.url = bucketManager.publicDownloadUrl(publicBucketDomain, key);
              return resolve()
            } else {
              return reject(respErr)
            }
          })
        })
      },
      delete(file) {
        return new Promise((resolve, reject) => {
          const key = `${prefix}/${file.hash}${file.ext}`
          bucketManager.delete(bucket, key, function (err, respBody, respInfo) {
            if (err) {
              return reject(err)
            }
            resolve();
          });
        });
      },
    };
  },
};
