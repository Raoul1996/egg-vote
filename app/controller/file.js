'use strict'
const fs = require('fs')
const path = require('path')
const toArray = require('stream-to-array')
const sendToWormhole = require('stream-wormhole')
const awaitWriteStream = require('await-stream-ready').write
const {getRandomSalt} = require('../utils/pass')
const {mkdirsSync, removeFile} = require('../utils/file')
const Controller = require('egg').Controller

class FileController extends Controller {
  async avatar() {
    const {ctx, service} = this
    const {url, file} = await this.buf()
    const payload = {url, file}
    payload.id = ctx.state.user.id
    const res = await service.file.avatar(payload)
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

  async del() {
    const {ctx, app, service} = this
    const {id} = ctx.state.user
    const {file} = ctx.request.body
    const namespace = `${ctx.state.user.id}`
    removeFile(path.join(app.config.static.dir, namespace + '', file))
    await service.file.del({id, file})
    ctx.helper.success({ctx, res: "删除成功"})
  }

  async info() {
    const {ctx, service} = this
    const {id} = ctx.state.user
    const {key} = ctx.request.body
    const res = await service.file.info({id, key})
    ctx.helper.success({ctx, res})
  }

  // always use to upload a single file
  async buf(avatar = true, name) {
    const {ctx, app, config} = this
    const stream = await ctx.getFileStream()
    const ext = path.extname(stream.filename).toLowerCase()
    if (avatar && !~config.multipart.allowAvatarImg.indexOf(ext)) {
      ctx.throw(406, "图片格式不正确")
    }
    let buf
    try {
      const parts = await toArray(stream)
      buf = Buffer.concat(parts)
    } catch (e) {
      await sendToWormhole(stream)
      throw e
    }
    // 在服务端由于使用了 https， 开启了 nginx 的缓存功能，所以通过生成随机数的方式进行缓存控制
    const filename = encodeURIComponent(name || getRandomSalt(2, 18)) +
      ext
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

   * @returns {Promise<{fields: string|string, files: Array}>}
   */
  async multiple(namespace = 'unknow', hash = false, upload = true) {
    const {ctx, app, service} = this
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
        user_id: +namespace,
        url: encodeURI(`${app.config.static.prefix}${namespace}/${filename}`),
        realname: stream.filename,
        file: filename,
        encoding: stream.encoding
      }
      if (upload) {
        const qiniuRes = await service.file.upload2Qiniu(res, target)
        // removeFile(target)
        res.qiniu = qiniuRes.url
        res.key = qiniuRes.key
        const upload = await service.file.save(res)
        res.upload = upload
      }
      files.push(res)
    }
    return {
      fields: parts.field,
      files
    }
  }
}

module.exports = FileController