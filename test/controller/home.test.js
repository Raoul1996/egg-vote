'use strict'

const {app, assert} = require('egg-mock/bootstrap')

describe('test/controller/home.test.js', () => {
  describe('GET /', () => {
    it('should status 200 and get the body ', () => {
      return app.httpRequest()
        .get('/')
        .expect('hi, egg')
        .expect(200)
    })
    it('should return the request body', () => {
      app.mockCsrf()
      return app.httpRequest()
        .post('/')
        .type('form')
        .send({foo: 'bar'})
        .expect(200)
        .expect({foo: 'bar'})
    })
    it('should send multi requests', async () => {
      await app.httpRequest()
        .get('/')
        .expect(200)
        .expect('hi, egg')
      const result = await app.httpRequest()
        .get('/')
        .expect(200)
        .expect('hi, egg')
      assert(result.status === 200)
    })
  })
})