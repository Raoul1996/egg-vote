const Service = require('egg').Service

class FileService extends Service {
  async avatar(payload) {
    const {app} = this
    const row = {
      id: payload.id,
      avatar: payload.url,
      updated_at: app.mysql.literals.now
    }
    const res = await app.mysql.update('users', row)
    return res.affectedRows === 1
  }
}

module.exports = FileService