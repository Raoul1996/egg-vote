module.exports = app => {
  return class UploaderService extends app.Service {
    // constructor(ctx) {
    //   super(ctx)
    // }
    async get(id) {
      const result = await app.mysql.get('records', {id: id})
      return result
    }

    async all() {
      const result = await app.mysql.select('records')
      return result
    }

    async save(data) {
      // 假如 我们拿到用户 id 从数据库获取用户详细信息
      console.log(data)
      const result = await app.mysql.insert('records', data)
      const insertSuccess = result.affectedRows === 1
      return insertSuccess
    }
  }
}
