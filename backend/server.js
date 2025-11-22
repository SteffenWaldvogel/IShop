const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

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

app.post('/api/checkout', async (req, res) => {
  const client = await pool.connect();

  try {
    console.log('Checkout-Payload empfangen:', req.body);

    const {
      customer,
      items,
      totals,
      shippingOption,
      paymentMethod,
      shippingAddress,
      billingAddress,
      billingSame
    } = req.body;

    const email = customer && customer.email ? customer.email : null;
    const phone = customer && customer.phone ? customer.phone : null;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Warenkorb ist leer' });
    }

    await client.query('BEGIN');

    const customerResult = await client.query(
      `
      INSERT INTO customers (email, phone)
      VALUES ($1, $2)
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

    let shippingMethodId;
    switch (shippingOption) {
      case 'standard':
        shippingMethodId = 1;
        break;
      case 'express':
        shippingMethodId = 2;
        break;
      case 'premium':
        shippingMethodId = 3;
        break;
      default:
        shippingMethodId = 1;
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

    const totalsum =
      totals && typeof totals.grandTotal === 'number'
        ? totals.grandTotal
        : 0;

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
        JSON.stringify({ shippingOption, paymentMethod }),
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

app.listen(port, () => {
  console.log('Server bereit auf Port ' + port);
});
