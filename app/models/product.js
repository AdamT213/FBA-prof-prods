"use strict";

const bookshelf = require('../db/bookshelf');

//each "product" is created via an upload from a file. The products are initially marked as profitable, but when they are ran through the seller's API, if they are found not to be profitable, they are deleted. 

const Product = bookshelf.Model.extend({
  tableName: 'products',
  initialize: function() {
  },
  hasTimestamps: true,
  distributor: function() {
    return this.belongsTo('distributors');
  },
});

module.exports = bookshelf.model('products', Product); 