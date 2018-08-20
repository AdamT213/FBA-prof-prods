
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('distributors', (tbl) => {
      tbl.increments('id').primary();
      tbl.string('name');
      tbl.timestamps();
    }),
    knex.schema.createTable('products', (tbl) => {
      tbl.increments('id').primary();
      tbl.string('title') 
      tbl.integer('SKU')
      tbl.string('UPC') 
      tbl.float('Price')
      tbl.boolean('isProfitable').defaultTo(true);
      tbl.float('totalMonthlySales'); 
      tbl.float('retailSellingPrice'); 
      tbl.float('amazonFees');
      tbl.float('productCost');
      tbl.float('profitMargin');
      tbl.integer('numberOfSellers'); 

      tbl.timestamps();
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('distributors')
    .dropTable('products')
};
