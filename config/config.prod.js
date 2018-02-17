const ip = require('ip')
module.exports = app => {
  const exports = {}
  // const localIP = ip.address()
  const domainWhiteList = []
  const portList = [7001, 9000, 9001]
  portList.forEach(port => {
    // domainWhiteList.push(`http://localhost:${port}`)
    // domainWhiteList.push(`http://127.0.0.1:${port}`)
    // domainWhiteList.push(`http://${localIP}:${port}`)
    domainWhiteList.push(`http://raoul1996.cn:${port}`)
  })
  domainWhiteList.push('ssr.raoul1996.cn')
  exports.security = {domainWhiteList}
  return exports
}
