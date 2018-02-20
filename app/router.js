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
    .get('/user/', controller.user.index)
    .get('/captcha', controller.user.captcha)
    .get('/txt', controller.user.txt)
    .get('/redis', controller.user.redis)
    .post('/login', controller.user.login)
    .post('/register', controller.user.register)
    .post('/update', controller.user.update)
    .post('/forget', controller.user.forget)
    .get('/api/list', controller.vote.list)
    .post('/avatar', controller.file.avatar)
}
