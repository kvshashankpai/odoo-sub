const db = require('../db');

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  const { name, type, sales_price, cost, is_recurring, billing_period } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO products (name, type, sales_price, cost, is_recurring, billing_period) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, type, sales_price, cost, is_recurring, billing_period]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};