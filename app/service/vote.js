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

  async create(payload) {
    const {ctx, app: {mysql}} = this
    const {title, startAt, endAt, isPublic, type, password, user_id, max, options} = payload
    const row = {
      title,
      start_at: new Date(startAt).getTime(),
      description: 'this is the test vote',
      end_at: new Date(endAt).getTime(),
      is_public: +isPublic,
      user_id,
      type,
      password,
      max_choose: max,
      has_pic: 0,
      created_at: mysql.literals.now
    }
    const coon = await mysql.beginTransaction()
    try {
      const {insertId} = await coon.insert('projects', row)
      options.forEach(async (item) => {
        await coon.insert('problems', Object.assign({}, {
          title: item.value,
          project_id: insertId,
          created_at: mysql.literals.now
        }))
      })
      await coon.commit()
      return insertId
    } catch (e) {
      await coon.rollback()
      if (e.code === 'ER_DUP_ENTRY') {
        ctx.throw(422, '投票名称重复')
      } else {
        ctx.throw(500, e)
        throw e
      }
    }
  }

  async detail(payload) {
    const {ctx, app: {mysql}} = this
    let _sql = `SELECT problems.* FROM problems
  INNER JOIN projects ON problems.project_id=projects.id
  WHERE project_id=${payload.id} AND password`
    // 这里是因为默认状态下 password 为 NULL
    if (payload.pwd === null) {
      _sql += ` IS NULL`
    } else {
      _sql += `="${payload.pwd}"`
    }
    const coon = await mysql.beginTransaction()
    try {
      const res = await coon.get('projects', {id: payload.id})
      const options = await coon.query(_sql)
      await coon.commit()
      return Object.assign({}, res, {options: options})
    } catch (e) {
      await coon.rollback()
      ctx.throw(500, e)
      throw e
    }
  }

  async statistic(payload) {
    const {ctx, app: {mysql}} = this
    const isExist = await mysql.get('projects', {id: payload.id})
    if (!isExist || isExist.user_id !== payload.user_id) {
      ctx.throw(403, '当前用户无权获取此投票数据')
      return
    }
    let _sql = `SELECT problems.title,problems.count FROM problems LEFT JOIN projects ON problems.project_id=projects.id WHERE project_id="${payload.id}"`
    const res = await mysql.query(_sql)
    return res
  }
}

module.exports = VoteService