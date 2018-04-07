const Controller = require('egg').Controller
const createRule = {
  title: {type: 'string', required: true, allowEmpty: false},
  type: {type: 'string', required: true, allowEmpty: false},
  max: {type: 'string', required: true, allowEmpty: false},
  startAt: {type: 'string', required: true, allowEmpty: false},
  endAt: {type: 'string', required: true, allowEmpty: false},
  isPublic: {type: 'string', required: true, allowEmpty: false},
  options: {type: 'array', required: true, allowEmpty: false}
}
const partRule = {
  options: {type: 'array', required: true, allowEmpty: false}
}
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
    const res = await service.vote.own({user_id: id})
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
    const {ctx, service} = this
    ctx.validate(createRule)
    const payload = ctx.request.body
    payload.user_id = ctx.state.user.id
    const res = await service.vote.create(payload)
    if (res) {
      ctx.helper.success({ctx, res: {id: res, msg: '投票创建成功'}})
      return
    }
    ctx.helper.fail({ctx, res: '投票创建失败', code: 10018})
  }

  async part() {
    const {ctx, service} = this
    ctx.validate(partRule)
    const {id} = ctx.params
    const {options} = ctx.request.body
    const res = await service.vote.part({id, options})
    if (res) {
      ctx.helper.success({ctx, res: '投票成功'})
      return
    }
    ctx.helper.fail({ctx, res, code: 10021})
  }

  async detail() {
    const {ctx, service} = this
    const {id} = ctx.params
    const {pwd = null} = ctx.query
    const res = await service.vote.detail({id: +id, pwd})
    if (res && res.id) {
      ctx.helper.success({ctx, res})
      return
    }
    ctx.helper.fail({ctx, res, code: 10019})
  }

  async statistic() {
    const {ctx, service} = this
    const {id} = ctx.params
    const user_id = ctx.state.user.id
    const res = await service.vote.statistic({user_id, id})
    if (res && res.length >= 1) {
      ctx.helper.success({ctx, res})
    } else {
      ctx.helper.fail({ctx, res, code: 10020})
    }
  }
}

module.exports = VoteController
