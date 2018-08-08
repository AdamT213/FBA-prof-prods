
module.exports = {

  testing: {
    client: 'postgresql',
    connection: {
      database: 'fba'
    },
    pool: {
      min:2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  development: {
    client: 'postgresql',
    connection: {
      database: 'fba',
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }, 

  production: { 
    client: 'postgresql', 
    connection: process.env.PRODUCTION_DB,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};