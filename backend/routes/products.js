const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.product_id,
        p.productname,
        p.description,
        p.price,
        p.quantity,
        pl.picturelink
      FROM products p
      LEFT JOIN LATERAL (
        SELECT picturelink
        FROM picturelinks
        WHERE product_id = p.product_id
        ORDER BY picturelink_id ASC
        LIMIT 1
      ) pl ON true
      ORDER BY p.product_id ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Fehler bei /api/products:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

module.exports = router;
