const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/api/shipping-methods', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        shipping_method_id,
        name,
        code,
        cost
      FROM shipping_methods
      ORDER BY shipping_method_id ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Fehler bei /api/shipping-methods:', err);
    res.status(500).json({ error: 'Interner Serverfehler bei Shipping Methods' });
  }
});

module.exports = router;
