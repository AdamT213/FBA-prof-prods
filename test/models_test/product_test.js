const chai = require('chai')

const bookshelf = require('../../app/db/bookshelf')
const Product = require('../../app/models/product')

const expect = chai.expect 

const mockDistributor = { 
  name: "WholesaleRUs",
} 

const mockProduct = { 
  title: "wooden claw",
  SKU: 128483,
  UPC: "you'll never find me",
  Price: 1.17,
  isProfitable: true,
  totalMonthlySales: 4058, 
  retailSellingPrice: 4.05,
  amazonFees: .5,
  profitMargin: 2.38,
  numberOfSellers: 25, 
  distributor_id: 1
} 

describe('Product', function() {
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
    return Product.forge().
      // we can use a transaction by setting
      // a `transacting` param in the options
      // we pass to `save()`
      save(mockProduct, { transacting: transaction }).
      then(product => {
        expect(product.get('title')).to.be.a('string')
        expect(product.get('title')).to.equal(mockProduct.title) 
        expect(product.get('SKU')).to.be.a('number')
        expect(product.get('SKU')).to.equal(mockProduct.SKU)
        expect(product.get('UPC')).to.be.a('string')
        expect(product.get('UPC')).to.equal(mockProduct.UPC) 
        expect(product.get('Price')).to.be.a('number') 
        expect(product.get('Price')).to.equal(mockProduct.Price)
        expect(product.get('isProfitable')).to.be.a('boolean')
        expect(product.get('isProfitable')).to.equal(mockProduct.isProfitable) 
        expect(product.get('totalMonthlySales')).to.be.a('number') 
        expect(product.get('totalMonthlySales')).to.equal(mockProduct.totalMonthlySales)
        expect(product.get('retailSellingPrice')).to.be.a('number') 
        expect(product.get('retailSellingPrice')).to.equal(mockProduct.retailSellingPrice)
        expect(product.get('amazonFees')).to.be.a('number') 
        expect(product.get('amazonFees')).to.equal(mockProduct.amazonFees)
        expect(product.get('profitMargin')).to.be.a('number') 
        expect(product.get('profitMargin')).to.equal(mockProduct.profitMargin)
        expect(product.get('numberOfSellers')).to.be.a('number') 
        expect(product.get('numberOfSellers')).to.equal(mockProduct.numberOfSellers)
        expect(product.get('distributor_id')).to.be.a('number') 
        expect(product.get('distributor_id')).to.equal(mockProduct.distributor_id)
      })
  })
})