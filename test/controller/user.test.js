'use strict'

const {app, assert} = require('egg-mock/bootstrap')
describe('test/controller/user.test.js', () => {
  describe('POST login/', () => {
    // beforeEach(() => {
    //   return app.httpRequest().get('/captcha')
    // })
    it('should return code 100010, captcha error', () => {
      return app.httpRequest()
        .post('/login')
        .type('form')
        .send({
          "email": "tellss@mail.com",
          "pwd": "123456",
          "captcha": "Q7WURU"
        }).expect(200, {
          code: 10010,
          data: "验证码错误"
        })
    })
    it('should return the user\'s message and token', () => {
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
          "captcha": "Q7WURU"
        }).expect(200).expect(res => assert(res) && assert(res.data.token))
    })
  })
  describe('POST register/', () => {
    it('should return a error response with 422', () => {
      return app.httpRequest()
        .post('/register')
        .type('form')
        .send({})
        .expect(422, {})
    })
    it('should return code 10002, password not match', function () {
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
    it('should return code 100010, captcha error', () => {
      return app.httpRequest()
        .post('/register')
        .type('form')
        .send({
          "name": "tests",
          "email": "tellss@mail.com",
          "mobile": "15033513589",
          "pwd": "123456",
          "confirm": "123456",
          "captcha": "Q7WURU"
        }).expect(200, {
          code: 10010,
          data: "验证码错误"
        })
    })
  })
})