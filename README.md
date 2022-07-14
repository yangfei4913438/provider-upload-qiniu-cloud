# provider-upload-qiniu-cloud
A provider for strapi server to upload file to Qiniu Cloud

# Requirements
- Node.js >= 14
- npm > 8

# Installation
```bash
$ npm install provider-upload-qiniu-cloud --save
```

or

```bash
$ yarn add provider-upload-qiniu-cloud --save
```

For more details, please see: https://strapi.io/documentation/developer-docs/latest/development/plugins/upload.html#using-a-provider

# Usage


### Strapi v4

The lastest version of the provider supports v4 by default. See example below for ```./config/plugins.js```:

```javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'qiniu',
      providerOptions: {
        accessKey: env('ACCESS_KEY', ''),
        secretKey: env('SECRET_KEY', ''),
        prefix: env('PREFIX', ''),
        zone: env('ZONE', 'Zone_z0'),
        bucket: env('BUCKET', ''),
        publicBucketDomain: env('PUBLIC_BUCKET_DOMAIN', ''),
        https: env('HTTPS', true),
        cdn: env('CDN', false),
      },
    },
  },
});
```

Official documentation [here](https://docs.strapi.io/developer-docs/latest/plugins/upload.html#enabling-the-provider)


### Security Middleware Configuration

Due to the default settings in the Strapi Security Middleware you will need to modify the `contentSecurityPolicy` settings to properly see thumbnail previews in the Media Library. You should replace `strapi::security` string with the object bellow instead as explained in the [middleware configuration](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html#loading-order) documentation.

`./config/middlewares.js`

```js
module.exports = [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', '*'],
          'media-src': ["'self'", 'data:', 'blob:', '*'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
];
```


### Provider Options

Property | type |  value
----- | ---- | ------------
**accessKey** | string | &lt;qiniu access key id&gt;
**secretKey** | string | &lt;qiniu access key secret&gt;
**bucket** | string | bucket name
**prefix** | string | dir name in bucket
**zone** | string | qiniu region (see Qiniu Development Documentation below)
**publicBucketDomain** | string | custom origin domain name for accessing the uploaded file, e.g. // example: http://if-pbl.qiniudn.com
**https** | boolean | Domain with or without https
**cdn** | boolean | Whether to use cdn acceleration when uploading


# Qiniu Development Documentation
https://developer.qiniu.com/kodo/1289/nodejs
