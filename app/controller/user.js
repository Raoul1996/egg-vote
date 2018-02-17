module.exports = app => {
  class UserController extends app.Controller {
    async index() {
      const {ctx} = this
      const {params: {id}} = ctx
      const res = await ctx.service.user.find(id)
      ctx.body = res
    }

    async login() {
      // 创建 token
      await this.ctx.render('app/app.js', {
        url: this.ctx.url.replace(/\/app/, '')
      })
    }

    async loginApi() {
      console.log(this.ctx.state)
      const token = app.jwt.sign({
        data: 27,
        exp: app.config.jwt.exp
      }, app.config.jwt.secret)
      this.ctx.body = token
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

  return UserController
}