const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '9029',
  database: 'ishop'
});

module.exports = pool;
