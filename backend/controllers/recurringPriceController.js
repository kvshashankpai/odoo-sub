const db = require('../db');

// Get all recurring prices for a product
exports.getRecurringPrices = async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await db.query('SELECT * FROM recurring_prices WHERE product_id = $1 ORDER BY id ASC', [productId]);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching recurring prices:', err);
    res.status(500).json({ error: 'Failed to fetch recurring prices' });
  }
};

// Create a recurring price
exports.createRecurringPrice = async (req, res) => {
  const { productId } = req.params;
  const { payment_mode, amount, interval, min_qty, start_date, end_date } = req.body;
  
  try {
    if (!payment_mode || !amount) {
      return res.status(400).json({ error: 'Payment mode and amount are required' });
    }

    const result = await db.query(
      'INSERT INTO recurring_prices (product_id, payment_mode, amount, interval, min_qty, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [productId, payment_mode, amount, interval || null, min_qty || null, start_date || null, end_date || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error creating recurring price:', err);
    res.status(500).json({ error: 'Failed to create recurring price' });
  }
};

// Delete a recurring price
exports.deleteRecurringPrice = async (req, res) => {
  const { priceId } = req.params;
  
  try {
    const result = await db.query('DELETE FROM recurring_prices WHERE id = $1 RETURNING *', [priceId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recurring price not found' });
    }
    res.json({ success: true, deleted: result.rows[0] });
  } catch (err) {
    console.error('❌ Error deleting recurring price:', err);
    res.status(500).json({ error: 'Failed to delete recurring price' });
  }
};

// Update a recurring price
exports.updateRecurringPrice = async (req, res) => {
  const { priceId } = req.params;
  const { payment_mode, amount, interval, min_qty, start_date, end_date } = req.body;
  
  try {
    const result = await db.query(
      'UPDATE recurring_prices SET payment_mode = $1, amount = $2, interval = $3, min_qty = $4, start_date = $5, end_date = $6 WHERE id = $7 RETURNING *',
      [payment_mode, amount, interval, min_qty, start_date, end_date, priceId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recurring price not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error updating recurring price:', err);
    res.status(500).json({ error: 'Failed to update recurring price' });
  }
};
