const path = require('path')
const util = require('util')

module.exports = () => {
  const skipExt = ['.png', '.jpeg', '.jpg', '.ico', '.gif']
  return function* (next) {
    const start = new Date().getTime()
    // 在执行 middleware 的时候，一旦抛出了 error，便进入 catch 流程，9999 对应非预期错误
    yield* next
    // if (this.type === 'application/json' && this.status === 200) {
    //   this.body = {
    //     code: 0,
    //     data: this.body
    //   }
    // }
    const rs = Math.ceil(new Date().getTime() - start)

    this.set('X-Response-Time', rs)
    const ext = path.extname(this.url).toLocaleLowerCase()
    const isSkip = skipExt.indexOf(ext) !== -1 && this.status < 400

    if (!isSkip) {
      const ip = this.get('X-Real-IP') || this.ip
      const port = this.get('X-Real-Port')
      const protocol = this.protocol.toUpperCase()
      const method = this.method
      const url = this.url
      const status = this.status
      const length = this.length || '-'
      const referrer = this.get('referrer') || '-'
      const ua = this.get('user-agent') || '-'
      const serverTime = this.response.get('X-Server-Response-Time') || '-'
      const message = util.format('[access] %s:%s - %s %s %s/%s %s %s %s %s %s',
        ip, port, method, url, protocol, status, length, referrer, rs, serverTime, ua)
      this.logger.info(message)
    }
  }
}

