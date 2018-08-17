
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('products', (tbl) => {
      tbl.string('ASIN')
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('products')
};
