const chai = require('chai')

const bookshelf = require('../../app/db/bookshelf')
const Distributor = require('../../app/models/distributor')

const expect = chai.expect 

const mockDistributor = { 
  name: "WholesaleRUs",
} 

describe('Distributor', function() {
  let transaction;
 
  beforeEach(done => {
    bookshelf.transaction(t => {
      transaction = t
      done()
    })
  })
 
  afterEach(function() {
    return transaction.rollback()
  })
 
  it('saves a record to the database', function() {
    return Distributor.forge().
      // we can use a transaction by setting
      // a `transacting` param in the options
      // we pass to `save()`
      save(mockDistributor, { transacting: transaction }).
      then(distributor => {
        expect(distributor.get('id')).to.be.a('number') 
        expect(distributor.get('name')).to.be.a('string')
        expect(distributor.get('name')).to.equal(mockDistributor.name)  
      })
  })
})