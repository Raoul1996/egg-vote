const Service = require('egg').Service

class VoteService extends Service {
  async list() {
    const res = await this.app.mysql.select('projects')
    return res
  }

  async ownList(payload) {
    const {app: {mysql}} = this
    // use mysql.get can only return one item, so use the mysql.select
    const res = await mysql.select('projects', {
      where: {user_id: payload.user_id}
    })
    return res
  }

  async own(payload) {
    const {app: {mysql}} = this
    const res = await mysql.get('projects', {user_id: payload.user_id, id: payload.id})
    return res
  }
}

module.exports = VoteService