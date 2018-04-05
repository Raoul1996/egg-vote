const path = require('path')
const ip = require('ip')
module.exports = app => {
  const exports = {}

  exports.static = {
    maxAge: 0 // maxAge 缓存，默认 1 年
  }

  exports.development = {
    watchDirs: ['build'], // 指定监视的目录（包括子目录），当目录下的文件变化的时候自动重载应用，路径从项目根目录开始写
    ignoreDirs: ['app/web', 'app/public', 'config'] // 指定过滤的目录（包括子目录）
  }

  exports.logview = {
    dir: path.join(app.baseDir, 'logs')
  }

  const localIP = ip.address()
  const domainWhiteList = [];
  [7001, 8080, 8081].forEach(port => {
    domainWhiteList.push(`http://localhost:${port}`)
    domainWhiteList.push(`http://127.0.0.1:${port}`)
    domainWhiteList.push(`http://0.0.0.0:${port}`)
    domainWhiteList.push(`http://${localIP}:${port}`)
  })
  exports.security = {domainWhiteList}
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
  return exports
}
