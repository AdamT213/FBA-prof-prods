
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
    connection: 'postgres://yzseonoxkkrykt:fa3f28caec77f6347446f3a0324280ad6bba6c191cfa884b27cb526365dd911f@ec2-107-21-98-165.compute-1.amazonaws.com:5432/dba646b89tvmfb',
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};