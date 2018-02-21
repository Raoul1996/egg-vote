'use strict'
const fs = require('fs')
const path = require('path')
const toArray = require('stream-to-array')
const sendToWormhole = require('stream-wormhole')
const {getRandomSalt} = require('../utils/pass')
const Controller = require('egg').Controller

class FileController extends Controller {
  async avatar() {
    const {ctx, service} = this
    const {url, file} = await this.upload()
    const payload = {url, file}
    payload.id = ctx.state.user.id
    const res = await service.user.avatar(payload)
    if (res) {
      ctx.helper.success({ctx, res: payload})
      return
    }
    ctx.helper.fail({ctx, res: '头像存储失败', code: 10005})
  }

  async upload(name) {
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
      real: target,
      encoding: stream.encoding,
      mimiType: stream.mimiType
    }
  }
}

module.exports = FileController