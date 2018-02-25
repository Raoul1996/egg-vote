const Controller = require('egg').Controller

class VoteController extends Controller {
  async index() {
    const {ctx, service} = this
    const res = await service.vote.list()
    if (res && res.length > 0) {
      ctx.helper.success({ctx, res})
      return
    }
    ctx.helper.fail({ctx, res, code: 10015})
  }

  async ownList() {
    const {ctx, service} = this
    const {id} = ctx.state.user
    const res = await service.vote.ownList({user_id: id})
    if (res && res.length > 0) {
      ctx.helper.success({ctx, res})
      return
    }
    ctx.helper.fail({ctx, res, code: 10015})
  }

  async own() {
    const {ctx, service} = this
    const user_id = ctx.state.user.id
    const {id} = ctx.params
    const res = await service.vote.own({user_id, id})
    if (res && res.id) {
      ctx.helper.success({ctx, res})
      return
    }
    ctx.helper.fail({ctx, res, code: 10015})
  }

  async del() {
    const {ctx, service} = this
    const user_id = ctx.state.user.id
    const {id} = ctx.params
    const res = await service.vote.del({user_id, id: +id})
    if (res) {
      ctx.helper.success({ctx, res: '投票删除成功'})
      return
    }
    ctx.helper.fail({ctx, res: '投票删除失败，请检查投票是否存在', code: 10016})
  }

  async create() {
    this.ctx.body = {test: 'test'}
  }

  async part() {
    this.ctx.body = {test: 'test'}
  }

  async detail() {
    this.ctx.body = {test: 'test'}
  }

  async statistic() {
    this.ctx.body = {test: 'test'}
  }
}

module.exports = VoteController
