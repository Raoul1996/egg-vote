const Controller = require('egg').Controller

class VoteController extends Controller {
  async list() {
    const {ctx} = this
    const {params: {id}} = ctx
    const res = await ctx.service.vote.list(id)
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

module.exports = VoteController
