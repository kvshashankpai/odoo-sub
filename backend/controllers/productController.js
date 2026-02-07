const db = require('../db');

exports.getProducts = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createProduct = async (req, res) => {
    const { name, product_type, sales_price, cost_price } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO products (name, product_type, sales_price, cost_price) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, product_type, sales_price, cost_price]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};