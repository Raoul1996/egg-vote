'use strict'

const Controller = require('egg').Controller

class HomeController extends Controller {
  async post() {
    this.ctx.body = this.ctx.request.body
  }

  async index() {
    this.ctx.body = 'hi, egg'
  }
}

module.exports = HomeController
