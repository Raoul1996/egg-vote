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
    const {ctx} = this
    const {params: {id}} = ctx
    const res = await ctx.service.user.find(id)
    ctx.helper.success({ctx, res})
  }

  async jwt() {
    const {app, ctx} = this
    const token = app.jwt.sign({
      data: 27,
      exp: app.config.jwt.exp
    }, app.config.jwt.secret)
    ctx.body = token
  }

  async login() {
    const {ctx, service, app} = this
    ctx.validate(loginRule)
    const payload = ctx.request.body
    const res = await service.user.login(payload)
    if (res && res.id) {
      res.token = app.jwt.sign({
        data: res.id,
        exp: app.config.jwt.exp
      }, app.config.jwt.secret)
      ctx.helper.success({ctx, res})
    } else {
      ctx.helper.fail({ctx, res, code: 10001})
    }
  }

  async register() {
    const {ctx, service, app} = this
    ctx.validate(registerRule)
    const {name, email, mobile, pwd, confirm} = ctx.request.body
    if (pwd !== confirm) {
      ctx.helper.fail({ctx, res: '密码不匹配', code: 10002})
    }
    const res = await service.user.register({name, email, mobile, pwd})
    if (res && res.insertId) {
      res.token = app.jwt.sign({
        data: res.id,
        exp: app.config.jwt.exp
      }, app.config.jwt.secret)
      ctx.helper.success({ctx, res})
    } else {
      ctx.helper.fail({ctx, res})
    }
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
    this.ctx.body = {test: 'mock'}
  }
}

module.exports = UserController
