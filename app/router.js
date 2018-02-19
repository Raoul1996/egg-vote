'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const {router, controller} = app
  router.resources('topics', '/api/v2/topics', controller.topics)
  router.get('/', controller.home.index)
    .get('/api/article/list', controller.app.list)
    .get('/api/article/:id', controller.app.detail)
    .get('/user/:id', controller.user.index)
    .post('/login', controller.user.login)
    .post('/register', controller.user.register)
    .get('/jwt', controller.user.jwt)
    .get('/api/list', controller.vote.list)
}
