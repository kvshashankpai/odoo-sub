const db = require('../db');

// Get all subscriptions
exports.getSubscriptions = async (req, res) => {
  try {
    // Join with users to get customer name
    const query = `
      SELECT s.*, u.name as customer_name 
      FROM subscriptions s 
      JOIN users u ON s.user_id = u.id 
      ORDER BY s.created_at DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create Subscription (Draft)
exports.createSubscription = async (req, res) => {
  const { user_id, lines } = req.body; // lines = [{ product_id, quantity, unit_price }]
  
  try {
    await db.query('BEGIN'); // Start Transaction

    // 1. Create Subscription Header
    const subCode = `SUB/${new Date().getFullYear()}/${Date.now()}`;
    const subRes = await db.query(
      `INSERT INTO subscriptions (code, user_id, status) VALUES ($1, $2, 'Draft') RETURNING id`,
      [subCode, user_id]
    );
    const subId = subRes.rows[0].id;
    
    let total = 0;

    // 2. Insert Lines & Calculate Total
    for (const line of lines) {
      const subtotal = line.quantity * line.unit_price;
      total += subtotal;
      await db.query(
        `INSERT INTO subscription_lines (subscription_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [subId, line.product_id, line.quantity, line.unit_price, subtotal]
      );
    }

    // 3. Update Total Amount
    await db.query('UPDATE subscriptions SET total_amount = $1 WHERE id = $2', [total, subId]);

    await db.query('COMMIT'); // Commit Transaction
    res.status(201).json({ message: 'Subscription created', id: subId, code: subCode });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
};

// Update Status (Draft -> Active -> Closed)
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Active' or 'Closed'

  try {
    let query = 'UPDATE subscriptions SET status = $1 WHERE id = $2 RETURNING *';
    let params = [status, id];

    // If Activating, set start date and next invoice
    if (status === 'Active') {
      const today = new Date();
      const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
      query = `UPDATE subscriptions SET status = $1, start_date = NOW(), next_invoice_date = $2 WHERE id = $3 RETURNING *`;
      params = [status, nextMonth, id];
    }

    const result = await db.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};