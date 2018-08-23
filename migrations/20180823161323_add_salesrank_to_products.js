
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('products', (tbl) => {
      tbl.integer('SalesRank')
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('products')
};
