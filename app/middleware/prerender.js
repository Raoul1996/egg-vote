const isbot = require('is-bot')
const puppeteer = require('puppeteer')
// 页面缓存过期时间，单位为分钟
const exp = 5
// 设置无头浏览器的调用频率，1 分钟可以调用多少次
const Hz = 5
// 页面信息缓存对象
let hash = {}
// 检测是否为搜索引擎爬虫
const reg = /googlebot|bingbot|baiduspider|linkedinbot|slackbot|Applebot|360spider|Sosospider|YoudaoBot|Sogou web spider/i
// 浏览器上次调用时间，默认为一分钟前
let latestUse = new Date().getTime() - 60 * 1000
module.exports = () => {
  return async function (ctx, next) {
    const ua = ctx.header['user-agent']
    if (isbot(ua) && !ua.match(reg) && !ua.match(/curl|postman/i)) {
      ctx.status = 206
    // } else if (ua.match(reg) || ua.match(/curl|postman/i)) {
    } else if (ua.match(reg) || ua.match(/curl|postman/i)) {
      let content = ''
      let url = ctx.url
      if (!hash[url]) hash[url] = {}
      if (hash[url].content && (new Date().getTime() - hash[url].timestamp) < exp * 60 * 1000) {
        // 如果 hash 中有该页面在 5 min 内的请求，那么就返回缓存中的内容
        ctx.body = hash[url].content
      } else {
        // 进行页面的重新渲染并且存入缓存，这一步对性能消耗非常大
        const timestamp = new Date().getTime()
        if (timestamp - latestUse < 60 * 1000 / Hz) {
          ctx.body = hash[url].content || '频率太快，清稍后重试'
        } else {
          const browser = await puppeteer.launch({
            headless: true
          })
          const page = await browser.newPage()
          await page.goto(`http://${ctx.header.host}${url}`)
          content = await page.content()
          await browser.close()
          // 暂时存到 hash，以后需要存到 redis 中
          hash[url].content = content
          hash[url].bot = ua.match(reg) && ua.match(reg)[0]
          // 存入的时间戳，单位为 ms
          hash[url].timestamp = timestamp
          latestUse = timestamp
          ctx.body = content
        }
      }
    } else {
      await next(ctx)
    }
  }
}