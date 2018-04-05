'use strict'

const {app} = require('egg-mock/bootstrap')

describe('test/controller/home.test.js', () => {
  describe('GET /', () => {
    it('should status 200 and get the body ', () => {
      return app.httpRequest()
        .get('/')
        .expect('hi, egg')
        .expect(200)
    })
  })
})