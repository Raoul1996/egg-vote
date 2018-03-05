const assert = require('assert')
module.exports = app => {
  app.passport.verify(async (ctx, user) => {
    assert(user.provider, 'user.provider should exists')
    assert(user.id, 'user.id should exists')
  })
}