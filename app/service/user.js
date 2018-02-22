const Service = require('egg').Service
const {cryptoPwd, getRandomSalt} = require('../utils/pass')
const {captchaConf} = require('../config')
const ccap = require('ccap')(captchaConf)

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
      if (isExist && isExist.id) {
        ctx.throw('user is exist')
      }
      // we need to store the salt value
      payload.salt = getRandomSalt()
      payload.pwd = cryptoPwd(payload.pwd, payload.salt)
      payload.created_at = this.getNowTime()
      const {insertId} = await app.mysql.insert('users', payload)
      const {id, name, mobile, email, avatar} = await this.findById(insertId)
      return {id, name, mobile, email, avatar}
    } catch (e) {
      throw e
    }
  }

  async forget(payload) {
    const {ctx, app: {mysql}} = this
    try {
      const isExist = await this.findByEmail(payload.email)
      if (!(isExist && isExist)) {
        ctx.throw(404, 'user is nor exist!')
      }
      const salt = getRandomSalt()
      const row = {
        id: isExist.id,
        salt: salt,
        pwd: cryptoPwd(payload.pwd, salt),
        updated_at: this.getNowTime()
      }
      const res = await mysql.update('users', row)
      return res.affectedRows === 1
    } catch (e) {
      throw e
    }
  }

  async update(payload) {
    const {ctx, app: {mysql}} = this
    const newSalt = getRandomSalt()
    const row = {
      id: payload.id,
      salt: newSalt,
      pwd: cryptoPwd(payload.pwd, newSalt),
      updated_at: this.getNowTime()
    }
    try {
      const {salt, pwd} = await this.findById(payload.id)
      if (!(cryptoPwd(payload.old, salt) === pwd)) {
        ctx.throw(422, '原密码错误')
        return false
      }
      if (cryptoPwd(payload.pwd, salt) === pwd) {
        ctx.throw(422, '新旧密码不能相同')
        return false
      }
      const res = await mysql.update('users', row)
      return res.affectedRows === 1
    } catch (e) {
      throw e
    }
  }

  async info(payload) {
    try {
      const {id, email, mobile, avatar} = await this.findById(payload.id)
      return {id, email, mobile, avatar}
    } catch (e) {
      throw e
    }
  }

  async avatar(payload) {
    const {app} = this
    const row = {
      id: payload.id,
      avatar: payload.url,
      updated_at: this.getNowTime()
    }
    const res = await app.mysql.update('users', row)
    return res.affectedRows === 1
  }

  async ccap() {
    const ary = ccap.get()
    return {captcha: ary[1], txt: ary[0]}
  }

  async findByEmail(email) {
    const {app} = this
    return await app.mysql.get('users', {email: email})
  }

  async findById(id) {
    const {app} = this
    return await app.mysql.get('users', {id: id})
  }

  getNowTime() {
    return this.app.mysql.literals.now
  }
}

module.exports = UserService
