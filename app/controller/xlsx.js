const Contrller = require('egg').Controller

class XlsxController extends Contrller {
  async index() {
    const {ctx, app} = this
    const res = await app.xlsx.analysis(ctx)
    ctx.body = res
  }
}

module.exports = XlsxController