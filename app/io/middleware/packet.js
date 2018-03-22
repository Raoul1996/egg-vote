module.exports = app => {
  return async (ctx, next) => {
    ctx.socket.emit('res', 'packed received')
    console.log(`packet: ${this.packet}`)
    await next()
  }
}