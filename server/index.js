require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/products', async (req, res) => {
  try {
    const rows = await db.query('SELECT id, name, price, cost, type, recurring FROM products ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/payments', async (req, res) => {
  try {
    const rows = await db.query("SELECT ref as id, date, customer, amount, method, status FROM payments ORDER BY ref");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log('Make sure DATABASE_URL is set for MySQL connection (e.g. mysql://user:pass@host:3306/db).');
});
