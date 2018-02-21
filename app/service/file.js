const Service = require('egg').Service

class FileService extends Service {
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

  async save(payload) {
    const {app: {mysql}} = this
    const isExist = await mysql.get('file', {file: payload.file})
    let res
    if (isExist && isExist.id) {
      res = await mysql.update('file',
        Object.assign({}, {id: isExist.id}, payload, {updated_at: this.nowTime()}))
      return res.affectedRows === 1
    }
    res = await mysql.insert('file', Object.assign({}, payload, {created_at: this.nowTime()}))
    return !!res.insertId
  }

  nowTime() {
    return this.app.mysql.literals.now
  }
}

module.exports = FileService