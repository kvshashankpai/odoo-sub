const db = require('../db');

// Get all discounts
exports.getDiscounts = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM discounts ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching discounts', err);
    res.status(500).json({ error: 'Failed to fetch discounts' });
  }
};

// Get single discount
exports.getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM discounts WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Discount not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching discount', err);
    res.status(500).json({ error: 'Failed to fetch discount' });
  }
};

// Create discount
exports.createDiscount = async (req, res) => {
  try {
    const { name, type, value, minPurchase, startDate, endDate } = req.body;
    if (!name || !type || value === undefined) return res.status(400).json({ error: 'Missing required fields' });

    const result = await db.query(
      `INSERT INTO discounts (name, type, value, min_purchase, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, type, value, minPurchase || 0, startDate || null, endDate || null]
    );
    res.status(201).json({ success: true, discount: result.rows[0] });
  } catch (err) {
    console.error('Error creating discount', err);
    res.status(500).json({ error: 'Failed to create discount' });
  }
};

// Update discount
exports.updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, value, minPurchase, startDate, endDate } = req.body;
    const existing = await db.query('SELECT * FROM discounts WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Discount not found' });

    const upd = await db.query(
      `UPDATE discounts SET name=$1, type=$2, value=$3, min_purchase=$4, start_date=$5, end_date=$6 WHERE id=$7 RETURNING *`,
      [name || existing.rows[0].name, type || existing.rows[0].type, value !== undefined ? value : existing.rows[0].value, minPurchase !== undefined ? minPurchase : existing.rows[0].min_purchase, startDate || existing.rows[0].start_date, endDate || existing.rows[0].end_date, id]
    );
    res.json({ success: true, discount: upd.rows[0] });
  } catch (err) {
    console.error('Error updating discount', err);
    res.status(500).json({ error: 'Failed to update discount' });
  }
};

// Delete discount
exports.deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT * FROM discounts WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Discount not found' });
    await db.query('DELETE FROM discounts WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting discount', err);
    res.status(500).json({ error: 'Failed to delete discount' });
  }
};
