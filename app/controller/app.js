'use strict'
const Model = require('../mocks/article/list')
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

  async list() {
    const pageIndex = this.ctx.query.pageIndex
    const pageSize = this.ctx.query.pageSize
    this.ctx.body = Model.getPage(pageIndex, pageSize)
  }

  async detail() {
    const id = this.ctx.query.id
    this.ctx.body = Model.getDetail(id)
  }
}

module.exports = AppController
