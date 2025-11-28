const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        product_id,
        productname,
        description,
        price,
        quantity
      FROM products
      ORDER BY product_id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Fehler bei /api/products:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

module.exports = router;
