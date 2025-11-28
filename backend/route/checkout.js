const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const redisClient = require('../config/redisClient');

router.post('/api/checkout', async (req, res) => {
  const client = await pool.connect();

  try {
    console.log('Checkout-Payload empfangen:', req.body);

    const {
      sessionId,
      customer,
      shippingOption,
      paymentMethod,
      shippingAddress,
      billingAddress,
      billingSame,
      paypalOrderId
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID fehlt' });
    }

    const cartKey = `cart:${sessionId}`;
    const cartData = await redisClient.hGetAll(cartKey);

    if (!cartData || Object.keys(cartData).length === 0) {
      return res.status(400).json({ error: 'Warenkorb ist leer' });
    }

    const items = Object.entries(cartData).map(([productId, quantity]) => ({
      product_id: parseInt(productId, 10),
      quantity: parseInt(quantity, 10)
    }));

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Warenkorb ist leer' });
    }

    const productIds = items.map(item => item.product_id);
    const productResult = await client.query(
      `
       SELECT product_id, price
       FROM products
       WHERE product_id = ANY($1::int[])
      `,
      [productIds]
    );

    const priceMap = {};
    for (const row of productResult.rows) {
      priceMap[row.product_id] = parseFloat(row.price);
    }

    let subtotal = 0;

    for (const item of items) {
      const price = priceMap[item.product_id];

      if (price == null || isNaN(price)) {
        throw new Error(`Kein Preis für Produkt-ID ${item.product_id} gefunden`);
      }

      subtotal += price * item.quantity;
    }

    const email = customer && customer.email ? customer.email : null;
    const phone = customer && customer.phone ? customer.phone : null;

    const shippingResult = await client.query(
      `
      SELECT shipping_method_id, cost
      FROM shipping_methods
      WHERE code = $1
      `,
      [shippingOption]
    );
    if (shippingResult.rows.length === 0) {
      throw new Error(`Ungültige Versandoption: ${shippingOption}`);
    }
    const shippingRow = shippingResult.rows[0];
    const shippingMethodId = shippingRow.shipping_method_id;
    const shippingCost = parseFloat(shippingRow.cost);

    const totalsum = subtotal + shippingCost;

    await client.query('BEGIN');

    const customerResult = await client.query(
      `
      INSERT INTO customers (email, phone)
      VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET
        phone = EXCLUDED.phone
      RETURNING customer_id
      `,
      [email, phone]
    );
    const customerId = customerResult.rows[0].customer_id;

    if (shippingAddress) {
      await client.query(
        `
        INSERT INTO customeraddress (
          customer_id,
          addresstype,
          street,
          house_nr,
          zip,
          city,
          country,
          additional_addressline
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (customer_id, addresstype) DO UPDATE SET
          street = EXCLUDED.street,
          house_nr = EXCLUDED.house_nr,
          zip = EXCLUDED.zip,
          city = EXCLUDED.city,
          country = EXCLUDED.country,
          additional_addressline = EXCLUDED.additional_addressline
        `,
        [
          customerId,
          'versand',
          shippingAddress.street,
          shippingAddress.houseNumber,
          shippingAddress.zip,
          shippingAddress.city,
          shippingAddress.country,
          `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`
        ]
      );
    }

    let finalBillingAddress = billingAddress;
    if (billingSame || !billingAddress) {
      finalBillingAddress = shippingAddress;
    }

    if (finalBillingAddress) {
      await client.query(
        `
        INSERT INTO customeraddress (
          customer_id,
          addresstype,
          street,
          house_nr,
          zip,
          city,
          country,
          additional_addressline
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (customer_id, addresstype) DO UPDATE SET
          street = EXCLUDED.street,
          house_nr = EXCLUDED.house_nr,
          zip = EXCLUDED.zip,
          city = EXCLUDED.city,
          country = EXCLUDED.country,
          additional_addressline = EXCLUDED.additional_addressline
        `,
        [
          customerId,
          'rechnung',
          finalBillingAddress.street,
          finalBillingAddress.houseNumber,
          finalBillingAddress.zip,
          finalBillingAddress.city,
          finalBillingAddress.country,
          `${finalBillingAddress.firstName || ''} ${finalBillingAddress.lastName || ''}`
        ]
      );
    }

    let paymentMethodId;
    switch (paymentMethod) {
      case 'paypal':
        paymentMethodId = 1;
        break;
      case 'payment-prepaid-banktransfer':
        paymentMethodId = 2;
        break;
      default:
        paymentMethodId = 1;
    }

    const orderResult = await client.query(
      `
      INSERT INTO orders (
        customer_id,
        payment_method_id,
        shipping_method_id,
        trackingnumber,
        time,
        status_id,
        comment,
        totalsum
      )
      VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7)
      RETURNING order_id
      `,
      [
        customerId,
        paymentMethodId,
        shippingMethodId,
        null,
        1,
        JSON.stringify({
          shippingOption,
          paymentMethod,
          shippingAddress,
          billingAddress: finalBillingAddress,
          paypalOrderId
        }),
        totalsum
      ]
    );
    const orderId = orderResult.rows[0].order_id;

    for (const item of items) {
      await client.query(
        `
        INSERT INTO orderitems (order_id, product_id, quantity)
        VALUES ($1, $2, $3)
        `,
        [orderId, item.product_id, item.quantity]
      );
    }

    await client.query('COMMIT');

    if (sessionId) {
      const cartKeyToDelete = `cart:${sessionId}`;
      await redisClient.del(cartKeyToDelete);
      console.log(`Warenkorb für Session ${sessionId} gelöscht nach Checkout`);
    }

    console.log('Checkout erfolgreich, Order-ID:', orderId);
    res.status(201).json({ orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Fehler bei /api/checkout:', err);
    res.status(500).json({ error: 'Fehler beim Checkout' });
  } finally {
    client.release();
  }
});

module.exports = router;
