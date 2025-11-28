require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;

require('./config/db');
require('./config/redisClient');

const paypalRoutes = require('./routes/paypal');
const productRoutes = require('./routes/products');
const shippingRoutes = require('./routes/shipping');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const orderRoutes = require('./routes/orders');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend läuft mit Postgres');
});

app.use(paypalRoutes);
app.use(productRoutes);
app.use(shippingRoutes);
app.use(cartRoutes);
app.use(checkoutRoutes);
app.use(orderRoutes);

app.listen(port, () => {
  console.log('Server bereit auf Port ' + port);
});
