const qiniuConfig = {
  ak: process.env.ak,
  sk: process.env.sk,
  bucket: 'vote',
  baseUrl: 'http://p4htepdga.bkt.clouddn.com/'
}
const captchaConf = {
  width: 256,
  height: 40,
  offset: 40,
  quality: 100,
  fontsize: 36
}
module.exports = {
  qiniuConfig, captchaConf
}