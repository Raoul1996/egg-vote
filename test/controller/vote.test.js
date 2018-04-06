'use strict'

const {app, mock} = require('egg-mock/bootstrap')
describe('test/controller/vote.test.js', () => {
  let token = null
  beforeEach(async () => {
    app.mockCsrf()
    app.mockSession({
      captcha: "Q7WURU",
      uid: 123
    })
    app.mockService('user', 'login', {
      id: 5,
      email: "tellss@gmail.com",
      // TODO: 这里的 Token 怎么获取
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZXhwIjoxNTMxNTg0OTk4LCJpYXQiOjE1MjI5NDUwMDR9.GNIeSfazlHT6o5cdm2MzNPtuWcZIh-Xz9YdYki6CgEo"
    })
    const r = await app.httpRequest()
      .post('/login')
      .type('form')
      .send({
        "email": "tells@gmail.com",
        "pwd": "123456",
        "captcha": "Q7WURU"
      })
    token = r.body.data.token
  })
  afterEach(mock.restore)
  describe('GET vote/list/', () => {
    it('should GET vote/list/ 200 OK', () => {
      app.mockService('vote', 'list', [{title: 'vote test'}])
      return app.httpRequest()
        .get('/vote/list')
        .set('Authorization', 'Bearer ' + token)
        .expect(200, {
          code: 0,
          data: [{title: 'vote test'}],
          msg: "^V^"
        })
    })
    it('should GET vote/list/ 200 fail 10015', () => {
      app.mockService('vote', 'list', [])
      return app.httpRequest()
        .get('/vote/list')
        .set('Authorization', 'Bearer ' + token)
        .expect(200, {
          code: 10015,
          data: []
        })
    })
  })
  describe('GET vote/own/(:id)', () => {
    it('should GET vote/own/ 200 OK', () => {
      app.mockService('vote', 'own', [{title: 'vote test'}])
      return app.httpRequest()
        .get('/vote/own')
        .set('Authorization', 'Bearer ' + token)
        .expect(200, {
          code: 0,
          data: [{title: 'vote test'}],
          msg: "^V^"
        })
    })
    it('should GET vote/own/ 200 fail 10015', () => {
      app.mockService('vote', 'own', [])
      return app.httpRequest()
        .get('/vote/own')
        .set('Authorization', 'Bearer ' + token)
        .expect(200, {
          code: 10015,
          data: []
        })
    })
    it('should GET vote/own/:id 200 OK', () => {
      app.mockService('vote', 'own', {id: 1, title: 'vote test'})
      return app.httpRequest()
        .get('/vote/own/1')
        .set('Authorization', 'Bearer ' + token)
        .expect(200, {
          code: 0,
          data: {
            id: 1,
            title: 'vote test'
          }, msg: '^V^'
        })
    })
    it('should GET vote/own/ 200 fail 10015', () => {
      app.mockService('vote', 'own', {})
      return app.httpRequest()
        .get('/vote/own/1')
        .set('Authorization', 'Bearer ' + token)
        .expect(200, {
          code: 10015,
          data: []
        })
    })
  })
  describe('DELETE vote/del/:id', () => {
    it('should DELETE vote/del/:id 200 OK', () => {
      app.mockService('vote', 'del', true)
      return app.httpRequest()
        .delete('/vote/del/1')
        .set('Authorization', 'Bearer ' + token)
        .expect(200, {
          code: 0,
          data: "投票删除成功",
          msg: "^V^"
        })
    })
    it('should DELETE vote/del/:id 200 fail 10016', () => {
      app.mockService('vote', 'del', false)
      return app.httpRequest()
        .delete('/vote/del/1')
        .set('Authorization', 'Bearer ' + token)
        .expect(200, {
          code: 10016,
          data: "投票删除失败，请检查投票是否存在"
        })
    })
  })
  describe('POST vote/create', () => {
    it('should POST vote/create 200 OK', () => {
      app.mockCsrf()
      app.mockService('vote', 'create', 1)
      return app.httpRequest()
        .post('/vote/create')
        .set('Authorization', 'Bearer ' + token)
        .type('form')
        .send({
          "title": "测试",
          "password": "123",
          "type": "1",
          "max": 1,
          "startAt": "2018-04-04T17:48:53.000Z",
          "endAt": "2018-04-17T17:48:56.000Z",
          "isPublic": false,
          "options": [{"value": "dsfgdfs"}, {"value": "dsfgdsg", "key": 1523036941217}]
        }).expect(200, {
          code: 0,
          data: {
            id: 1,
            msg: "投票创建成功"
          },
          msg: "^V^"
        })
    })
  })
})