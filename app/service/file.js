const Service = require('egg').Service

class FileService extends Service {
  /**
   * 将头像文件保存到本地
   * @param payload
   * @returns {Promise<boolean>}
   */
  async avatar(payload) {
    const {app} = this
    const row = {
      id: payload.id,
      avatar: payload.url,
      updated_at: this.nowTime()
    }
    const res = await app.mysql.update('users', row)
    return res.affectedRows === 1
  }

  /**
   * 将上传文件的信息保存到数据库
   * @param payload
   * @returns {Promise<boolean>}
   */
  async save(payload) {
    const {app: {mysql}} = this
    const isExist = await this.fileExist(payload)
    let res
    if (isExist && isExist.id) {
      res = await mysql.update('file',
        Object.assign({}, {id: isExist.id}, payload, {updated_at: this.nowTime()}))
      return res.affectedRows === 1
    }
    res = await mysql.insert('file', Object.assign({}, payload, {created_at: this.nowTime()}))
    return !!res.insertId
  }

  /**
   * 删除本地文件并在数据库中删除对应条目之后，记录到 delete 表中
   * @param payload
   * @returns {Promise<void>}
   */
  async del(payload) {
    const {ctx, app: {mysql}} = this
    const where = {user_id: payload.id, file: payload.file}
    const conn = await mysql.beginTransaction()
    try {
      const {user_id, file, qiniu} = await conn.get('file', where)
      await conn.insert('del', {user_id, file, qiniu, deleted_at: this.nowTime()})
      await conn.delete('file', where)
      await conn.commit()
    } catch (e) {
      await conn.rollback()
      ctx.throw(500, e)
      throw e
    }
  }

  /**
   * 传入文件的真实地址等元素构成的对象，并根据文件的绝对路径将其上传至七牛
   * 如果数据库中有对应文件信息，则不上传
   * @param payload {Object} 包含文件真实访问地址，真实名称的对象
   * @returns {Promise<Object>} 七牛对应的公开链接, 对应的 key 值
   */
  async upload2Qiniu(payload, path) {
    // TODO: Config the https domain
    const {app} = this
    // 如果文件已经存在，就没有必要上传七牛了
    const isExist = await this.fileExist(payload)
    if (isExist && isExist.id) {
      return {url: isExist.qiniu, key: isExist.key}
    } else {
      return await app.qiniu.upload(path, payload.realname)
    }
  }

  async info(payload) {
    const {app} = this
    return await app.qiniu.info(payload.key || '')
  }

  /**
   * 根据用户的 user_id 和 filename 查询文件的记录
   * @param payload
   * @returns {Promise<void>}
   */
  async fileExist(payload) {
    return this.app.mysql.get('file', {user_id: payload.user_id || payload.id, file: payload.file})
  }

  /**
   * 获取 mysql 系统时间
   */
  nowTime() {
    return this.app.mysql.literals.now
  }
}

module.exports = FileService