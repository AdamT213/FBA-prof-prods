
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('products', (tbl) => {
      tbl.integer('distributor_id').references('distributors.id');
      tbl.dropColumn('productCost');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('products')
};
