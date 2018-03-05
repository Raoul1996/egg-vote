module.exports = () => {
  const exports = {}
  // const localIP = ip.address()
  const domainWhiteList = []
  const portList = [12012,7001,8080]
  portList.forEach(port => {
    domainWhiteList.push(`http://localhost:${port}`)
    domainWhiteList.push(`http://127.0.0.1:${port}`)
    domainWhiteList.push(`http://${localIP}:${port}`)
    domainWhiteList.push(`http://raoul1996.cn:${port}`)
  })
  domainWhiteList.push('egg.raoul1996.cn')
  exports.security = {domainWhiteList}
  return exports
}
