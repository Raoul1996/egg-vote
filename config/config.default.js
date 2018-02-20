const path = require('path')
const fs = require('fs')
const cert = fs.readFileSync(__dirname + '/../id_rsa.enc')
module.exports = app => {
  const exports = {}

  // exports.siteFile = {
  //   '/favicon.ico': fs.readFileSync(path.join(app.baseDir, 'app/web/asset/images/favicon.ico'))
  // }
  exports.bodyParser = {
    enable: true
  }
  exports.gzip = {
    match: '/public'
  }
  exports.view = {
    cache: false
  }
  exports.logger = {
    consoleLevel: 'DEBUG',
    dir: path.join(app.baseDir, 'logs')
  }

  exports.static = {
    prefix: '/public/',
    dir: path.join(app.baseDir, '/public/')
  }

  exports.keys = app.name + 'lost heart, lost soul'
  exports.mysql = {
    // 单数据库信息配置
    client: {
      // host
      host: '127.0.0.1',
      // 端口号
      port: '3306',
      // 用户名
      user: 'root',
      // 密码
      password: 'root',
      // 数据库名
      database: 'vote'
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: true
  }
  exports.middleware = ['access',
    'errorHandler']
  exports.errorHandler = {
    match: '/'
  }
  exports.security = {
    csrf: {
      enable: false
    },
    xssProtection: {
      enable: true
    }
  }
  exports.jwt = {
    secret: cert,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    expiresIn: '24h',
    algorithm: 'RS256',
    enable: true,
    match(ctx) {
      // const reg = /\/api|\/register|\/forget/i
      const reg = /\/update|\/user|\/vote/i
      return reg.test(ctx.request.url)
    }
  }
  exports.rest = {
    urlprefix: '/api/', // Prefix of rest api url. Default to /api/
    authRequest: null,
    // authRequest: async ctx => {
    //   // A truthy value must be returned when authentication succeeds.
    //   // Otherwise the client will be responded with `401 Unauthorized`
    //   return accesstoken;
    // }

    // Specify the APIs for which authentication can be ignored.
    // If authRequest is configured, authentication for all APIs is required by default.
    authIgnores: null
    // authIgnores: {
    //   users: {
    //     show: true, // allow GET /api/users/:id to ignore authentication
    //     index: true,
    //   }
    // }
  }
  exports.passportGithub = {
    key: '8b79e52fc393da70ef6f',
    secret: '37d7ad74f6d6558d0a3975f79d6fcbdea58de6ac'
  }
  exports.onerror = {
    errorPageUrl: (err, ctx) => ctx.errorPageUrl || '/500'
  }
  // exports.bizerror = {
  //   breakDefault: false, // disable default error handler
  //   sendClientAllParams: false, // return error bizParams to user
  //   interceptAllError: false // handle all exception, not only bizError exception
  // }
  exports.captchaConf = {
    width: 256,
    height: 40,
    offset: 40,
    quality: 100,
    fontsize: 36
  }
  return exports
}
