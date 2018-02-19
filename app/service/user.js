const Service = require('egg').Service
const {cryptoPwd} = require('../utils/pass')

class UserService extends Service {
  // constructor(ctx) {
  //   super(ctx)
  // }
  async login(payload) {
    const {ctx} = this
    try {
      const {id, name, mobile, email, avatar, salt, pwd} = await this.findByEmail(payload.email)
      if (!id) {
        ctx.throw(404, 'user not found')
      }
      if (pwd !== cryptoPwd(payload.pwd, salt)) {
        ctx.throw(404, 'password is not match')
      }
      return {id, name, mobile, email, avatar}
    } catch (e) {
      throw e
    }
  }

  async register(payload) {
    const {ctx, app} = this
    try {
      const isExist = await this.findByEmail(payload.email)
      if (isExist) {
        ctx.throw('user is exist')
      }
      payload.pwd = cryptoPwd(payload.pwd)
      const {insertId} = await app.mysql.insert('users', payload)
      const {id, name, mobile, email, avatar} = await this.findById(insertId)
      return {id, name, mobile, email, avatar}
    } catch (e) {
      throw e
    }
  }

  async findByEmail(email) {
    const {app} = this
    return await app.mysql.get('users', {email: email})
  }

  async findById(id) {
    const {app} = this
    return await app.mysql.get('users', {id: id})
  }
}

module
  .exports = UserService