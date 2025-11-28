const express = require('express');
const router = express.Router();
const { paypalClient, paypal } = require('../services/paypalClient');

router.post('/api/paypal/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Betrag fehlt' });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'EUR',
          value: amount.toFixed ? amount.toFixed(2) : amount
        }
      }]
    });

    const response = await paypalClient().execute(request);

    console.log('PayPal Order erstellt:', response.result.id);
    return res.status(201).json({ orderId: response.result.id, status: response.result.status });
  } catch (err) {
    console.error('Fehler bei /api/paypal/create-order:', err);
    return res.status(500).json({ error: 'Fehler bei Create der PayPal-Bestellung' });
  }
});

router.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Bestell-ID fehlt' });
    }

    const client = paypalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await client.execute(request);
    console.log('PayPal Order Request:', response.result.id);
    console.log('PayPal Order Status:', response.result.status);
    console.log('PayPal Purchase Units:', response.result.purchase_units);

    return res.status(200).json({
      orderId: response.result.id,
      status: response.result.status,
      purchase_units: response.result.purchase_units
    });
  } catch (err) {
    console.error('Fehler bei /api/paypal/capture-order:', err);
    return res.status(500).json({ error: 'Fehler bei Capture der PayPal-Bestellung' });
  }
});

module.exports = router;
