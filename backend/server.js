const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

const port = 3000;
const products = [{ id: 1, name: 'Product 1', description: 'Description of Product 1', price: 129.99 },
  { id: 2, name: 'Product 2', description: 'Description of Product 2', price: 129.99 },
  { id: 3, name: 'Product 3', description: 'Description of Product 3', price: 129.99 }]


app.get('/', (req, res) => {
    res.send('Backend läuft')
});

app.get('/api/products', (req, res) => {
    res.json(products)
});

app.listen(port, () => {
    console.log('Server bereit auf Port 3000')
});

