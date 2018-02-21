'use strict'
const fs = require('fs')
const path = require('path')
const toArray = require('stream-to-array')
const sendToWormhole = require('stream-wormhole')
const awaitWriteStream = require('await-stream-ready').write
const {getRandomSalt} = require('../utils/pass')
const {mkdirsSync} = require('../utils/file')
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
   * @param name 文件的名称，不指定为 16 位随机数
   * @param hash 是否使用真实文件名称，默认使用
   * @param safe 是否返回文件绝对路径
   * @returns {Promise<{fields: string|string, files: Array}>}
   */
  async multiple(namespace = 'unknow', hash = false, safe = true) {
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
      files.push({
        url: `${app.config.static.prefix}${namespace}/${filename}`,
        realname: stream.filename,
        file: filename,
        path: safe ? '' : target,
        encoding: stream.encoding,
        mimiType: stream.mimiType
      })
    }
    return {
      fields: parts.field,
      files
    }
  }
}

module.exports = FileController