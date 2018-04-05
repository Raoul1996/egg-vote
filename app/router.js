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
    .get('/user', controller.user.index)
    .get('/captcha', controller.user.captcha)
    .get('/txt', controller.user.txt)
    .post('/login', controller.user.login)
    .post('/register', controller.user.register)
    .post('/update', controller.user.update)
    .post('/forget', controller.user.forget)
    .post('/send', controller.user.send)
    .get('/verify', controller.user.verify)
    .post('/user/avatar', controller.file.avatar)
    .post('/file/upload', controller.file.upload)
    .delete('/file/del', controller.file.del)
    .post('/file/info', controller.file.info)
    .get('/vote/list', controller.vote.index)
    .get('/vote/own', controller.vote.ownList)
    .get('/vote/own/:id', controller.vote.own)
    .delete('/vote/del/:id', controller.vote.del)
    .post('/vote/create', controller.vote.create)
    .post('/vote/part/:id', controller.vote.part)
    .get('/vote/detail/:id', controller.vote.detail)
    .get('/vote/statistic/:id', controller.vote.statistic)
    .post('/xlsx', controller.xlsx.index)
}
