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
  return exports
}
