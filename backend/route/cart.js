const express = require('express');
const router = express.Router();
const redisClient = require('../config/redisClient');

router.get('/api/cart/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const cartKey = `cart:${sessionId}`;

    const cartData = await redisClient.hGetAll(cartKey);

    if (!cartData || Object.keys(cartData).length === 0) {
      return res.json({ items: [] });
    }

    const items = Object.entries(cartData).map(([productId, quantity]) => ({
      product_id: parseInt(productId, 10),
      quantity: parseInt(quantity, 10)
    }));

    res.json({ items });
  } catch (err) {
    console.error('Fehler bei Redis Cart Get Funktion', err);
    res.status(500).json({ error: 'Fehler beim Abrufen des Warenkorbs' });
  }
});

router.post('/api/cart/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const cartKey = `cart:${sessionId}`;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Keine Artikel im Warenkorb / Falsches Format' });
    }

    const hashData = {};
    const timeToLiveCart = 3600;

    for (const item of items) {
      if (!item.product_id || !item.quantity) {
        continue;
      }
      hashData[item.product_id] = String(item.quantity);
    }

    if (Object.keys(hashData).length === 0) {
      await redisClient.del(cartKey);
      return res.json({ message: 'Warenkorb geleert' });
    }

    await redisClient.del(cartKey);
    await redisClient.hSet(cartKey, hashData);
    await redisClient.expire(cartKey, timeToLiveCart);
    res.json({ message: 'Warenkorb gespeichert' });
  } catch (err) {
    console.error('Fehler bei Redis Post Cart Funktion', err);
    res.status(500).json({ error: 'Fehler beim Speichern des Warenkorbs' });
  }
});

router.get('/api/redis-test', async (req, res) => {
  try {
    await redisClient.set('ishop:test', 'Hello World', { EX: 60 });

    const value = await redisClient.get('ishop:test');

    res.json({
      message: 'Redis test',
      key: 'ishop:test',
      value: value
    });
  } catch (err) {
    console.error('Fehler bei /api/redis-test:', err);
    res.status(500).json({ error: 'Redis-Test fehlgeschlagen' });
  }
});

module.exports = router;
