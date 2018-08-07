"use strict";

const bookshelf = require('../db/bookshelf');

//each "distributor" is a separate organization that has its own inventory sheets, ostensibly only one, but potentially more than one, and they may change over time. Each distributor will have many items and files, and eventually, will belong to a user. So a user adds their distibutors, uploads their files for each distributor, and the profitable products are then organized by distributor. 

const Distributor = bookshelf.Model.extend({
  tableName: 'distributors',
  initialize: function() {
  },
  hasTimestamps: true,
  // sessions: function() {
  //   return this.belongsTo('sessions');
  // },
});

module.exports = bookshelf.model('distributors', Distributor); 
