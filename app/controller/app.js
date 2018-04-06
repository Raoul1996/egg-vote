'use strict'
const Controller = require('egg').Controller

// app.passport.verify(async (ctx, user) => {
//   assert(user.provider, 'user.provider should exists')
//   assert(user.id, 'user.id should exists')
// })
class AppController extends Controller {
  async index() {
    await this.ctx.render('app/app.js', {
      url: this.ctx.url.replace(/\/app/, '')
    })
  }
}

module.exports = AppController
