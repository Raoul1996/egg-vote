const Service = require('egg').Service
const {cryptoPwd, getRandomSalt} = require('../utils/pass')
const {createMail} = require('../utils/mail')
const {captchaConf} = require('../config')
const ccap = require('ccap')(captchaConf)
const crypto = require('crypto')

class UserService extends Service {
  // constructor(ctx) {
  //   super(ctx)
  // }
  async login(payload) {
    const {ctx} = this
    try {
      const {id, name, mobile, email, avatar, salt, pwd, status} =
        await this.findByEmail(payload.email)
      if (!id) {
        ctx.throw(404, 'user not found')
      }
      if (pwd !== cryptoPwd(payload.pwd, salt)) {
        ctx.throw(404, 'password is not match')
      }
      return {id, name, mobile, email, avatar, status}
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

  async send(payload) {
    const {ctx, app: {email, mysql}} = this
    try {
      const res = await this.findByEmail(payload.mail)
      if (res && res.id) {
        const row = {
          id: res.id,
          active_code: crypto.randomBytes(16).toString('hex'),
          // 15分钟过期
          exp: Math.floor(Date.now() / 1000) + (0.25 * 60 * 60),
          updated_at: this.getNowTime()
        }
        if (!res.status) {
          if ((res.exp * 1000 - Date.now() < 50 * 60 * 60) || !res.exp) {
            await mysql.update('users', row)
            return await email.sendEmail('激活邮件', "", payload.mail,
              [createMail(Object.assign({}, res, row))])
          } else {
            return {message: "不要频繁发送邮件，请于 3 分钟后重试"}
          }
        } else {
          ctx.throw(406, '账户已经激活，无需再次发送激活邮件')
        }
      } else {
        ctx.throw(404, '用户不存在')
      }
    } catch (e) {
      ctx.throw(500, e)
      throw e
    }
  }

  async verify(payload) {
    const {ctx, app: {mysql}} = this
    const res = await mysql.get('users', {active_code: payload})
    if (res && res.id) {
      if (!res.status) {
        const row = {
          id: res.id,
          status: 1,
          updated_at: this.getNowTime()
        }
        const active = await mysql.update('users', row)
        return active.affectedRows === 1
      } else {
        ctx.throw(406, '用户已经激活，无须重复激活')
      }
    } else {
      ctx.throw(404, '激活链接错误')
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

  getNowTime() {
    return this.app.mysql.literals.now
  }
}

module.exports = UserService
