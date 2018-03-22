const Controller = require('egg').Controller

class ChatController extends Controller {
  async index() {
    const {ctx, service} = this
    const message = ctx.args[0]
    console.log(`chat:${message}:${process.pid}`)
    const say = await service.user.say
    ctx.socket.emit('res', say)
  }
}


module.exports = ChatController