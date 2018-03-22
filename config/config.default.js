const path = require('path')
const fs = require('fs')
const cert = fs.readFileSync(__dirname + '/../id_rsa.enc')
module.exports = app => {
  const exports = {}
  exports.siteFile = {
    '/favicon.ico': fs.readFileSync(path.join(app.baseDir, 'favicon.ico'))
  }
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
  exports.session = {
    maxAge: 24 * 3600 * 1000, // ms
    key: 'lost heart',
    httpOnly: true,
    encrypt: true
  }
  exports.sessionStore = {
    async get(key) {
      const res = await app.redis.get(key)
      if (!res) return null
      return JSON.parse(res)
    },

    async set(key, value, maxAge) {
      // maxAge not present means session cookies
      // we can't exactly know the maxAge and just set an appropriate value like one day
      if (!maxAge) maxAge = 24 * 60 * 60 * 1000
      value = JSON.stringify(value)
      await app.redis.set(key, value, 'PX', maxAge)
    },

    async destroy(key) {
      await app.redis.del(key)
    }
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
  exports.redis = {
    client: {
      host: '127.0.0.1',
      port: '6379',
      password: 'redisraoul',
      db: '0'
    },
    agent: true
  }
  exports.middleware = ['access',
    'errorHandler']
  exports.errorHandler = {
    match: '/'
  }
  exports.cors = {
    // origin: 'https://votes.raoul1996.cn',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    credentials: true
  }
  exports.security = {
    xframe: {
      enable: false
    },
    csp: {
      enable: false
    },
    csrf: {
      enable: false
    },
    xssProtection: {
      enable: false
    }
  }
  exports.jwt = {
    secret: cert,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60 * 100),
    expiresIn: '24h',
    algorithm: 'RS256',
    enable: true,
    match(ctx) {
      // const reg = /\/api|\/register|\/forget/i
      const reg = /\/update|\/user|\/upload|\/file|\/send|\/vote/i
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
    secret: process.env.votepass
  }
  exports.onerror = {
    errorPageUrl: (err, ctx) => ctx.errorPageUrl || '/500'
  }
  // exports.bizerror = {
  //   breakDefault: false, // disable default error handler
  //   sendClientAllParams: false, // return error bizParams to user
  //   interceptAllError: false // handle all exception, not only bizError exception
  // }
  exports.multipart = {
    fileSize: '50mb',
    allowAvatarImg: [// images
      '.jpg', '.jpeg', // image/jpeg
      '.png', // image/png, image/x-png
      '.gif'
    ],
    domainWhiteList: [// images
      '.jpg', '.jpeg', // image/jpeg
      '.png', // image/png, image/x-png
      '.gif', // image/gif
      '.bmp', // image/bmp
      '.wbmp', // image/vnd.wap.wbmp
      '.webp',
      '.tif',
      '.psd',
      // text
      '.svg',
      '.js', '.jsx',
      '.json',
      '.css', '.less',
      '.html', '.htm',
      '.xml',
      '.pdf',
      // tar
      '.zip',
      '.gz', '.tgz', '.gzip',
      // video
      '.mp3',
      '.mp4',
      '.avi'
    ]
  }
  exports.email = {
    username: '1259510125@qq.com',
    password: process.env.qqpass,
    host: 'smtp.qq.com',
    port: 465,
    sender: '1259510125@qq.com'
  }
  exports.captcha = {
    width: 256, // set width,default is 256
    height: 60, // set height,default is 60
    offset: 40, // set text spacing,default is 40
    quality: 100, // set pic quality,default is 50
    fontsize: 57, // set font size,default is 57
  }
  exports.qiniu = {
    ak: process.env.ak,
    sk: process.env.sk,
    bucket: 'vote',
    baseUrl: 'http://p4htepdga.bkt.clouddn.com/',
    zone: 'Zone_z0',
  }
  exports.xlsx = {}
  exports.io = {
    init: {wsEngine: 'uws'},
    namespace: {
      '/': {
        connectionMiddleware: [],
        packetMiddleware: []
      },
    }
  }
  return exports
}
