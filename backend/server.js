const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

const port = 3000;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '9029',
  database: 'ishop'
});

app.get('/', (req, res) => {
  res.send('Backend läuft mit Postgres');
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        product_id AS id,
        productname AS name,
        description,
        price
      FROM products
      ORDER BY product_id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Fehler bei /api/products:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

app.listen(port, () => {
  console.log('Server bereit auf Port ' + port);
});
