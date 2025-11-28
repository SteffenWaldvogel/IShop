const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/api/orders/:orderId', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);

    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Ungültige Bestell-ID' });
    }

    const orderResult = await pool.query(
      `
      SELECT
        o.order_id,
        o.time,
        o.totalsum,
        o.trackingnumber,
        o.comment,
        os.name AS status_name,
        pm.name AS payment_method,
        sm.name AS shipping_method,
        sm.cost AS shipping_cost
      FROM orders o
      JOIN order_statuses os ON o.status_id = os.status_id
      JOIN payment_methods pm ON o.payment_method_id = pm.payment_method_id
      JOIN shipping_methods sm ON o.shipping_method_id = sm.shipping_method_id
      WHERE o.order_id = $1
      `,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bestellung nicht gefunden' });
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `
      SELECT
        oi.product_id,
        p.productname,
        oi.quantity,
        p.price
      FROM orderitems oi
      JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1
      `,
      [orderId]
    );

    const items = itemsResult.rows.map(row => ({
      product_id: row.product_id,
      productname: row.productname,
      quantity: row.quantity,
      price: parseFloat(row.price)
    }));

    let shippingAddress = null;
    let billingAddress = null;

    if (order.comment) {
      try {
        const commentData = JSON.parse(order.comment);
        shippingAddress = commentData.shippingAddress || null;
        billingAddress = commentData.billingAddress || null;
      } catch (err) {
        console.error('Fehler beim Parsen der Bestellkommentare:', err);
      }
    }

    res.json({
      orderId: order.order_id,
      time: order.time,
      totalsum: parseFloat(order.totalsum),
      trackingnumber: order.trackingnumber,
      status: order.status_name,
      paymentMethod: order.payment_method,
      shippingMethod: {
        name: order.shipping_method,
        cost: parseFloat(order.shipping_cost)
      },
      shippingAddress,
      billingAddress,
      items
    });
  } catch (err) {
    console.error('Fehler bei /api/orders/:orderId:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Bestellung' });
  }
});

module.exports = router;
