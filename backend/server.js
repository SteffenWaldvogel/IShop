require('dotenv').config();

const paypal = require('@paypal/checkout-server-sdk');
const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
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

const redisClient = redis.createClient({
  url: 'redis://localhost:6379'
});
redisClient.on('error', (err) => console.log('Redis Client Fehler', err));
redisClient.connect().then(() => {
  console.log('Mit Redis-Server verbunden');
}).catch((err) => {
  console.error('Fehler bei der Verbindung zu Redis:', err);
});

function paypalClient() {
  const environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
  return new paypal.core.PayPalHttpClient(environment);
}

app.get('/', (req, res) => {
  res.send('Backend läuft mit Postgres');
});

app.post('/api/paypal/create-order', async (req, res) => {
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

app.post('/api/paypal/capture-order', async (req, res) => {
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

app.get('/api/redis-test', async (req, res) => {
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

app.get('/api/cart/:sessionId', async (req, res) => {
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

app.post('/api/cart/:sessionId', async (req, res) => {
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

app.post('/api/checkout', async (req, res) => {
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

app.listen(port, () => {
  console.log('Server bereit auf Port ' + port);
});
