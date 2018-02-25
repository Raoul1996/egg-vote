const Service = require('egg').Service

class VoteService extends Service {
  async list() {
    const {app: {mysql}} = this
    const res = await mysql.select('projects')
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

  async del({user_id, id}) {
    const {ctx, app: {mysql}} = this
    const projectRow = {
      user_id,
      id
    }
    const problemRow = {
      project_id: id
    }
    const isExist = await mysql.get('projects', projectRow)
    if (isExist && (isExist.user_id !== user_id)) {
      ctx.throw(406, '该投票无权删除')
      return false
    }
    const coon = await mysql.beginTransaction()
    let res = false
    try {
      const temp1 = await coon.delete('projects', projectRow)
      const temp2 = await coon.delete('problems', problemRow)
      await coon.commit()
      res = temp1.affectedRows === 1 && temp2.affectedRows >= 1
    } catch (e) {
      await coon.rollback()
      ctx.throw(500, e)
      throw e
    }
    return res
  }
}

module.exports = VoteService