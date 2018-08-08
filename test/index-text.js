const chai = require('chai')
 

const app = require('../app')

const supertest = require('supertest')
 
const expect = chai.expect

let server
 
before(function() {
  return app.up().then(_server => {
    server = _server
  })
})
 
after(function() {
  server.close()
})
 
describe('app', function() {
  describe('up', function() {
    it('is a function', function() {
      expect(app.up).to.be.an.instanceof(Function)
    })
  })
  
  describe('/api/distributors', function() {
    describe('POST', function() {
      it('fails with an empty request body', function(done) {
        supertest(server).
          post('/api/distributors').
          expect(400, done)
      })
 
      
      it('succeeds with valid distributor values', function(done) {
        supertest(server).
          post('/api/distributors').
          send({
            name: 'Unity Wholesale',
          }).
          set('content-type', 'application/json').
          expect(200, done)
      })
    })
  }) 
})
  