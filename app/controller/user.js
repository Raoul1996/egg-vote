const Controller = require('egg').Controller
const loginRule = {
  // mobile: 'string',
  email: {type: 'string', required: true, allowEmpty: false},
  pwd: {type: 'string', required: true, allowEmpty: false},
  captcha: {type: 'string', required: true, allowEmpty: false}
}
const registerRule = {
  name: {type: 'string', required: true, allowEmpty: false},
  email: {type: 'string', required: true, allowEmpty: false},
  mobile: {type: 'string', required: true, allowEmpty: false},
  pwd: {type: 'string', required: true, allowEmpty: false},
  confirm: {type: 'string', required: true, allowEmpty: false},
  captcha: {type: 'string', required: true, allowEmpty: false}
}
const forgetRule = {
  email: {type: 'string', required: true, allowEmpty: false},
  mobile: {type: 'string', required: true, allowEmpty: false},
  captcha: {type: 'string', required: true, allowEmpty: false},
  pwd: {type: 'string', required: true, allowEmpty: false},
  confirm: {type: 'string', required: true, allowEmpty: false}
}
const updateRule = {
  captcha: {type: 'string', required: true, allowEmpty: false},
  pwd: {type: 'string', required: true, allowEmpty: false},
  old: {type: 'string', required: true, allowEmpty: false},
  confirm: {type: 'string', required: true, allowEmpty: false}
}

class UserController extends Controller {
  async index() {
    const {ctx, service} = this
    const {id} = ctx.state.user
    const res = await service.user.info({id: id})
    if (res && res.id) {
      ctx.helper.success({ctx, res})
      return
    }
    ctx.helper.fail({ctx, res, code: 10003})
  }

  async login() {
    const {ctx, service} = this
    ctx.validate(loginRule)
    const payload = ctx.request.body
    if (payload.captcha !== ctx.session.captcha) {
      ctx.helper.fail({ctx, res: '验证码错误', code: 10010})
      return
    }
    const res = await service.user.login(payload)
    if (res && res.id) {
      res.token = this.jwt(res.id)
      ctx.helper.success({ctx, res})
      return
    }
    ctx.helper.fail({ctx, res, code: 10001})
  }

  async register() {
    const {ctx, service} = this
    ctx.validate(registerRule)
    const {name, email, mobile, pwd, confirm, captcha} = ctx.request.body
    if (pwd !== confirm) {
      ctx.helper.fail({ctx, res: '密码不匹配', code: 10002})
      return
    }
    if (captcha !== ctx.session.captcha) {
      ctx.helper.fail({ctx, res: '验证码错误', code: 10010})
      return
    }
    const res = await service.user.register({name, email, mobile, pwd})
    if (res && res.id) {
      res.token = this.jwt(res.id)
      ctx.helper.success({ctx, res})
      return
    }
    ctx.helper.fail({ctx, res, code: 9999})
  }

  async forget() {
    const {ctx, service} = this
    ctx.validate(forgetRule)
    const {mobile, pwd, email, confirm, captcha} = ctx.request.body
    if (captcha !== ctx.session.captcha) {
      ctx.helper.fail({ctx, res: '验证码错误', code: 10010})
      return
    }
    if (pwd !== confirm) {
      ctx.helper.fail({ctx, res: '密码不匹配', code: 10002})
      return
    }
    const res = await service.user.forget({mobile, pwd, email})
    if (res) {
      ctx.helper.success({ctx, res: '密码重置成功'})
      return
    }
    ctx.helper.fail({ctx, res, code: 9999})
  }

  async update() {
    const {ctx, service} = this
    ctx.validate(updateRule)
    const {pwd, old, confirm, captcha} = ctx.request.body
    if (captcha !== ctx.session.captcha) {
      ctx.helper.fail({ctx, res: '验证码错误', code: 10010})
      return
    }
    const id = ctx.state.user.id
    if (pwd !== confirm) {
      ctx.helper.fail({ctx, res: '密码不匹配', code: 10002})
      return
    }
    const res = await service.user.update({id, pwd, old})
    if (res) {
      ctx.helper.success({ctx, res: '密码修改成功'})
      return
    }
    ctx.helper.fail({ctx, res: '密码修改失败', code: 10006})
  }

  async send() {
    const {ctx, service} = this
    const {mail} = ctx.request.body
    const {msg} = await service.user.send({mail})
    // 这里由于组件的封装，所以和其他部分不太一样
    if (msg && msg.header) {
      ctx.helper.success({ctx, res: msg})
      return
    }
    ctx.helper.fail({ctx, res: msg, code: 10011})
  }

  async verify() {
    const {ctx, service} = this
    const res = await service.user.verify(ctx.req.query.active)
    if (res) {
      ctx.helper.success({ctx, res: '用户激活成功'})
      return
    }
    ctx.helper.fail({ctx, res: '用户激活失败', code: 10012})
  }

  async captcha() {
    const {ctx, service} = this
    const {captcha, txt} = await service.user.captcha()
    ctx.body = captcha
    ctx.type = 'image/png'
    ctx.session.captcha = txt
  }

  async txt() {
    const {ctx} = this
    ctx.body = ctx.session.captcha
  }

  async redis() {
    const {ctx, app} = this
    await app.redis.set('foo', 'bar')
    ctx.body = await app.redis.get('foo')
  }

  jwt(id) {
    const {app} = this
    return app.jwt.sign({
      id: id,
      exp: app.config.jwt.exp
    }, app.config.jwt.secret)
  }
}

module.exports = UserController
