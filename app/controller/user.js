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
    ctx.helper.fail({ctx, res})
  }

  async forget() {
    this.ctx.body = {test: 'mock'}
  }

  async update() {
    this.ctx.body = {test: 'mock'}
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

  jwt(id) {
    const {app} = this
    const token = app.jwt.sign({
      id: id,
      exp: app.config.jwt.exp
    }, app.config.jwt.secret)
    return token
  }
}

module.exports = UserController
