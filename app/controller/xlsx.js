const Contrller = require('egg').Controller

class XlsxController extends Contrller {
  async index() {
    const {ctx, app} = this
    const res = await app.xlsx.analysis(ctx)
    if (res) {
      ctx.helper.success({ctx, res})
      return
    }
    ctx.helper.fail({ctx, res: '文件解析失败', code: 10031})
  }
}

module.exports = XlsxController