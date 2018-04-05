'use strict'

const {app, mock, assert} = require('egg-mock/bootstrap')
describe('test/controller/user.test.js', () => {
  afterEach(mock.restore)
  describe('GET user/', () => {
    let token = null
    // get a useful token
    before(async () => {
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
    it('should GET user/ 401 Unauthorized', () => {
      return app.httpRequest().get('/user').set('Authorization', 'Bearer ' + null).expect(401)
    })
    it('should GET user/ 200 get info fail 10003', () => {
      app.mockService('user', 'info', {})
      return app.httpRequest().get('/user').set('Authorization', 'Bearer ' + token).expect(200, {
        code: 10003, data: {}
      })
    })
    it('should GET user/ 200 OK', () => {
      app.mockService('user', 'info', {
        id: 5,
        email: 'tells@gmail.com',
        name: "tests",
        mobile: '15033513589',
        avatar: null
      })
      return app.httpRequest().get('/user').set('Authorization', 'Bearer ' + token).expect(200, {
        code: 0, data: {
          id: 5,
          email: 'tells@gmail.com',
          name: "tests",
          mobile: '15033513589',
          avatar: null
        }, msg: "^V^"
      })
    })
  })
  describe('POST login/', () => {
    it('should POST login/ 404 user not found', () => {
      app.mockCsrf()
      app.mockSession({
        captcha: "Q7WURU",
        uid: 123
      })
      const err = new Error('user not found')
      err.status = 404
      app.mockService('user', 'login', err)
      return app.httpRequest().post('/login').type('form').send({
        "email": "tellsss@gmail.com",
        "pwd": "123456",
        "captcha": "Q7WURU"
      }).expect(404, {status: 404})
    })
    it('should POST login/ 200 captcha error 10010', () => {
      app.mockCsrf()
      app.mockSession({
        captcha: "Q7WURU",
        uid: 123
      })
      return app.httpRequest()
        .post('/login')
        .type('form')
        .send({
          "email": "tellss@mail.com",
          "pwd": "123456",
          "captcha": "Q7WUR2"
        }).expect(200, {
          code: 10010,
          data: "验证码错误"
        })
    })
    it('should POST login/ 200 login fail 10001', () => {
      app.mockCsrf()
      app.mockSession({
        captcha: "Q7WURU",
        uid: 123
      })
      app.mockService('user', 'login', {})
      return app.httpRequest()
        .post('/login')
        .type('form')
        .send({
          "email": "tells@gmail.com",
          "pwd": "123456",
          "captcha": "Q7WURU"
        }).expect(200, {code: 10001, data: {}})
    })
    it('should POST login/ 200 OK', () => {
      app.mockCsrf()
      app.mockSession({
        captcha: "Q7WURU",
        uid: 123
      })
      app.mockService('user', 'login', {
        id: 5,
        email: 'tells@gmail.com',
        name: "tests",
        mobile: '15033513589',
        avatar: null,
        token: 'this is the test token'
      })
      return app.httpRequest()
        .post('/login')
        .type('form')
        .send({
          "email": "tells@gmail.com",
          "pwd": "123456",
          "captcha": "Q7WURU"
        }).expect(200, {
          code: 0,
          data: {
            id: 5,
            email: 'tells@gmail.com',
            name: "tests",
            mobile: '15033513589',
            avatar: null,
            token: 'this is the test token'
          }, msg: "^V^"
        })
    })
  })
  describe('POST register/', () => {
    it('should POST register/ 422 validation failed', async () => {
      app.mockCsrf()
      const err = new Error('validation failed')
      err.status = 422
      app.mockService('user', 'register', err)
      const r = await app.httpRequest()
        .post('/register')
        .type('form')
        .send({})
      assert(r.status === 422)
    })
    it('should POST register/ 200 password not match 10002', () => {
      app.mockCsrf()
      app.mockSession({
        captcha: "Q7WURU",
        uid: 123
      })
      return app.httpRequest()
        .post('/register')
        .type('form')
        .send({
          "name": "tests",
          "email": "tellss@mail.com",
          "mobile": "15033513589",
          "pwd": "123456",
          "confirm": "1234567",
          "captcha": "Q7WURU"
        }).expect(200, {
          code: 10002,
          data: "密码不匹配"
        })
    })
    it('should POST register/ 200 captcha error 10010', () => {
      app.mockCsrf()
      app.mockSession({
        captcha: "Q7WURU",
        uid: 123
      })
      return app.httpRequest()
        .post('/register')
        .type('form')
        .send({
          "name": "tests",
          "email": "tellss@mail.com",
          "mobile": "15033513589",
          "pwd": "123456",
          "confirm": "123456",
          "captcha": "Q7WUR"
        }).expect(200, {
          code: 10010,
          data: "验证码错误"
        })
    })
    it('should POST register/ 200 OK', () => {
      app.mockCsrf()
      app.mockSession({
        captcha: "Q7WURU",
        uid: 123
      })
      app.mockService('user', 'register', {
        id: 5,
        email: 'tells@gmail.com',
        name: "tests",
        mobile: '15033513589',
        avatar: null,
        token: 'this is the test token'
      })
      return app.httpRequest()
        .post('/register')
        .type('form')
        .send({
          name: "tests",
          email: "tellss@mail.com",
          mobile: "15033513589",
          pwd: "123456",
          confirm: "123456",
          captcha: "Q7WURU"
        }).expect(200, {
          code: 0,
          data: {
            id: 5,
            email: 'tells@gmail.com',
            name: "tests",
            mobile: '15033513589',
            avatar: null,
            token: 'this is the test token'
          }, msg: "^V^"
        })
    })
    it('should POST register/ 200 register fail 9999', () => {
      app.mockCsrf()
      app.mockSession({
        captcha: "Q7WURU",
        uid: 123
      })
      app.mockService('user', 'register', {})
      return app.httpRequest()
        .post('/register')
        .type('form')
        .send({
          name: "tests",
          email: "tellss@mail.com",
          mobile: "15033513589",
          pwd: "123456",
          confirm: "123456",
          captcha: "Q7WURU"
        }).expect(200, {
          code: 9999,
          data: {}
        })
    })
  })
})