const createMail = (payload) => {
  const mail = `<h1>egg-voter 激活邮件</h1>
<div>亲爱的${payload.name}，这是由<a href="https://github.com/Raoul1996/egg-vote">egg-vote</a>发送的用户激活邮件。</div>
<div>如果您注册了 <a href="https://github.com/Raoul1996/egg-vote">egg-vote</a>，请点击此链接进行激活：<a href="http://egg.raoul1996.cn/verify?active=${payload.active_code}">激活链接</a></div>
<div>如果激活链接无法使用，请将以下内容复制到浏览器地址栏进行访问</div>
<div>http://egg.raoul1996.cn/verify?active=${payload.active_code}</div>
<div>如果您没有注册，则请忽略这封邮件</div><div>非常感谢您的耐心阅读，爱你的 egg-vote 开发者。</div>
<div>如果您在开发环境，那么开发环境下的链接则为</div>
<div>http://localhost:7001/verify?active=${payload.active_code}</div>
`
  return {data: mail, alternative: true}
}
module.exports = {
  createMail
}