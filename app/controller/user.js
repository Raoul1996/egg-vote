const Controller = require('egg').Controller
const loginRule = {
  // mobile: 'string',
  email: {type: 'string', required: true, allowEmpty: false},
  pwd: {type: 'string', required: true, allowEmpty: false},
  captcha: {type: 'string', required: false, allowEmpty: true}
}
const registerRule = {
  name: {type: 'string', required: true, allowEmpty: false},
  email: {type: 'string', required: true, allowEmpty: false},
  mobile: {type: 'string', required: true, allowEmpty: false},
  pwd: {type: 'string', required: true, allowEmpty: false},
  confirm: {type: 'string', required: true, allowEmpty: false},
  captcha: {type: 'string', required: false, allowEmpty: true}
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
    const {name, email, mobile, pwd, confirm} = ctx.request.body
    if (pwd !== confirm) {
      ctx.helper.fail({ctx, res: '密码不匹配', code: 10002})
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
    if (pwd !== confirm) {
      ctx.helper.fail({ctx, res: '密码不匹配', code: 10002})
      return
    }
    // TODO: Validate captcha
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
    const id = ctx.state.user.id
    if (pwd !== confirm) {
      ctx.helper.fail({ctx, res: '密码不匹配', code: 10002})
      return
    }
    const res = await service.user.update({id, pwd, old})
    console.log(res)
    if (res) {
      ctx.helper.success({ctx, res: '密码修改成功'})
      return
    }
    ctx.helper.fail({ctx, res: '密码修改失败', code: 10006})
  }

  async send() {
    this.ctx.body = {test: 'mock'}
  }

  async captcha() {
    const {ctx, service} = this
    const {captcha, txt} = await service.user.ccap()
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
