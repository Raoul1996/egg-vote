const Service = require('egg').Service

class VoteService extends Service {
  // constructor(ctx) {
  //   super(ctx)
  // }

  async list() {
    try {
      const res = await this.app.mysql.select('projects')
      return res
    } catch (e) {
      this.ctx.throwBizError('USER_NOT_FOUND', e, {bizError: true})
    }
  }
}

module.exports = VoteService