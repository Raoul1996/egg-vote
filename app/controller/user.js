const Controller = require('egg').Controller
const createRule = {
  // mobile: 'string',
  password: 'string',
  email: 'string',
  captcha: 'string'
}

class UserController extends Controller {
  async index() {
    const {ctx} = this
    const {params: {id}} = ctx
    const res = await ctx.service.user.find(id)
    ctx.body = res
  }

  async login() {
    const {app, ctx} = this
    const token = app.jwt.sign({
      data: 27,
      exp: app.config.jwt.exp
    }, app.config.jwt.secret)
    ctx.body = token
  }

  async loginAPi() {
    const {ctx} = this
    ctx.validate(createRule)
    ctx.body = {test: 'mock'}
  }

  async register() {
    this.ctx.body = {test: 'mock'}
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
