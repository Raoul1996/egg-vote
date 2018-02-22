const {qiniuConfig, qiniuConfig: {ak, sk}} = require('../config')
const {getRandomSalt} = require('../utils/pass')
const qiniu = require('qiniu')
const mac = new qiniu.auth.digest.Mac(ak, sk)
const options = {
  // scope: `${qiniuConfig.bucket}:${keyToOverwrite}`,
  scope: `${qiniuConfig.bucket}`,
  expires: 24 * 60 * 60
}
const putPolicy = new qiniu.rs.PutPolicy(options)
const uploadToken = putPolicy.uploadToken(mac)
const config = new qiniu.conf.Config()
// 华东区对应的是z0
config.zone = qiniu.zone.Zone_z0
const formUploader = new qiniu.form_up.FormUploader(config)
const putExtra = new qiniu.form_up.PutExtra()
const bucketManager = new qiniu.rs.BucketManager(mac, config)
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
    // const keyToOverwrite = payload.realname
    const localFile = path
    // const key = payload.realname
    const extname = payload.realname.split('.')[payload.realname.split('.').length - 1]
    const key = getRandomSalt(2, 18) + "." + extname
    // 如果文件已经存在，就没有必要上传七牛了
    const isExist = await this.fileExist(payload)
    if (isExist && isExist.id) {
      return {url: isExist.qiniu, key: isExist.key}
    } else {
      return new Promise((resolved, reject) => {
        formUploader.putFile(uploadToken, key, localFile, putExtra,
          function (respErr, respBody, respInfo) {
            if (respErr) {
              reject(respErr)
            }
            if (respInfo.statusCode === 200) {
              resolved(respBody)
            } else {
              resolved(respBody)
            }
          })
        // 拼接出真实的访问链接并返回
      }).then(res => {
        return {
          url: qiniuConfig.baseUrl + encodeURI(res.key),
          key: res.key
        }
      })
    }
  }

  async info(payload) {
    const {ctx} = this
    return new Promise((resolved, reject) => {
      bucketManager.stat(qiniuConfig.bucket, payload.key, function (err, respBody, respInfo) {
        if (err) {
          ctx.throw(500, err)
          reject(err)
        } else {
          if (respInfo.statusCode === 200) {
            resolved(respBody)
          } else {
            // throw respInfo.statusCode
            resolved(respBody)
          }
        }
      })
      // const res = await mysql.get('file', {user_id: payload.id, key: payload.key})
      // return res
    })
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