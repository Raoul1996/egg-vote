'use strict'
const fs = require('fs')
const path = require('path')
const toArray = require('stream-to-array')
const sendToWormhole = require('stream-wormhole')
const awaitWriteStream = require('await-stream-ready').write
const {getRandomSalt} = require('../utils/pass')
const {mkdirsSync} = require('../utils/file')
const {qiniuConfig} = require('../config')
const qiniu = require('qiniu')
const Controller = require('egg').Controller

class FileController extends Controller {
  async avatar() {
    const {ctx, service} = this
    const {url, file} = await this.buf()
    const payload = {url, file}
    payload.id = ctx.state.user.id
    const res = await service.user.avatar(payload)
    if (res) {
      ctx.helper.success({ctx, res: payload})
      return
    }
    ctx.helper.fail({ctx, res: '头像存储失败', code: 10005})
  }

  async upload() {
    const {ctx} = this
    const res = await this.multiple(ctx.state.user.id)
    ctx.body = res
  }

  // always use to upload a single file
  async buf(name) {
    const {ctx, app} = this
    const stream = await ctx.getFileStream()
    let buf
    try {
      const parts = await toArray(stream)
      buf = Buffer.concat(parts)
    } catch (e) {
      await sendToWormhole(stream)
      throw e
    }
    const filename = encodeURIComponent(name || stream.fields.name || getRandomSalt(2, 18)) +
      path.extname(stream.filename).toLowerCase()
    const target = path.join(app.config.static.dir, filename)
    await fs.writeFile(target, buf)
    // ctx.body = target
    return {
      url: app.config.static.prefix + filename,
      file: filename,
      path: target,
      encoding: stream.encoding,
      mimiType: stream.mimiType
    }
  }

  // always use to upload more than one file
  /**
   * 同时上传多个文件
   * @param namespace 用户的命名空间，默认为 unknown
   * @param hash 是否使用真实文件名称，默认使用
   * @param upload 是否上传到七牛，默认使用
   * @param safe 是否返回文件绝对路径
   * @returns {Promise<{fields: string|string, files: Array}>}
   */
  async multiple(namespace = 'unknow', hash = false, upload = true, safe = true) {
    const {ctx, app} = this
    const parts = ctx.multipart({autoFields: true})
    const files = []
    let stream
    // convert the arg to string
    namespace = namespace + ''
    // stream maybe return a false value
    while (stream = await parts()) {
      mkdirsSync(`${app.config.static.dir}${namespace}`)
      const filename = hash ? getRandomSalt(2, 18) + path.extname(stream.filename).toLowerCase()
        : stream.filename
      const target = path.join(app.config.static.dir, namespace, filename)
      const writeStream = fs.createWriteStream(target)
      try {
        await awaitWriteStream(stream.pipe(writeStream))
      } catch (e) {
        await sendToWormhole(stream)
        throw e
      }
      const res = {
        url: `${app.config.static.prefix}${namespace}/${filename}`,
        realname: stream.filename,
        file: filename,
        path: target,
        encoding: stream.encoding
      }
      if (upload) {
        const qiniuRes = await this.upload2Qiniu(res)
        res.qiniu = qiniuRes
      }
      if (safe) delete res.path
      files.push(res)
    }
    return {
      fields: parts.field,
      files
    }
  }

  /**
   * 传入文件的真实地址等元素构成的对象，并根据文件的绝对路径将其上传至七牛
   * @param payload {Object} 包含文件真实访问地址，真实名称的对象
   * @returns {Promise<string>} 七牛对应的公开链接
   */
  async upload2Qiniu(payload) {
    // TODO: Config the https domain
    const ak = qiniuConfig.ak
    const sk = qiniuConfig.sk
    const mac = new qiniu.auth.digest.Mac(ak, sk)
    // const keyToOverwrite = payload.realname
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
    const localFile = payload.path
    const formUploader = new qiniu.form_up.FormUploader(config)
    const putExtra = new qiniu.form_up.PutExtra()
    const key = payload.realname
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
    }).then(res => qiniuConfig.baseUrl + encodeURI(res.key))
  }
}

module.exports = FileController