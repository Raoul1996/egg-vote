const ip = require('ip')
module.exports = () => {
  const exports = {}
  const localIP = ip.address()
  const domainWhiteList = []
  const portList = [8080, 7001]
  portList.forEach(port => {
    domainWhiteList.push(`http://localhost:${port}`)
    domainWhiteList.push(`http://0.0.0.0:${port}`)
    domainWhiteList.push(`http://127.0.0.1:${port}`)
    domainWhiteList.push(`http://${localIP}:${port}`)
  })
  domainWhiteList.push('https://votes.raoul1996.cn')
  domainWhiteList.push('http://egg.raoul1996.cn')
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
