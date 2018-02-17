
module.exports = app => {
  return class UserService extends app.Service {
    // constructor(ctx) {
    //   super(ctx)
    // }

    async find(uid) {
      // 假如 我们拿到用户 id 从数据库获取用户详细信息
      try {
        const {id, email, name} = await app.mysql.get('users', {id: uid})
        console.log(await app.mysql.get('users', {id: uid}))
        return {id, email, name}
      } catch (e) {
        this.ctx.throwBizError('USER_NOT_FOUND', e, {bizError: true})
      }
    }
  }
}