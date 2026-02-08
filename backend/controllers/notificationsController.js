const db = require('../db');

// Fetch notifications (optionally filter by unread)
exports.getNotifications = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM notifications ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ getNotifications error:', err.stack || err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Mark a notification as read
exports.markRead = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ markRead error:', err.stack || err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Generate notifications for upcoming renewals (next 7 days)
exports.generateNotifications = async (req, res) => {
  try {
    // Find subscriptions with next_billing_date in next 7 days
    const query = `
      SELECT id, customer_name, next_billing_date
      FROM subscriptions
      WHERE next_billing_date IS NOT NULL
        AND status = 'confirmed'
        AND next_billing_date <= NOW() + INTERVAL '7 days'
        AND next_billing_date >= NOW()
    `;

    const subs = (await db.query(query)).rows;

    let inserted = 0;
    for (const s of subs) {
      // Avoid duplicate open notifications for same subscription and period
      const exists = await db.query(
        `SELECT 1 FROM notifications WHERE subscription_id = $1 AND type = 'renewal_due' AND created_at >= NOW() - INTERVAL '14 days' LIMIT 1`,
        [s.id]
      );

      if (exists.rows.length === 0) {
        const message = `Subscription for ${s.customer_name} is due for renewal on ${new Date(s.next_billing_date).toLocaleDateString()}`;
        await db.query(
          `INSERT INTO notifications (subscription_id, type, message, is_read, created_at) VALUES ($1, $2, $3, false, NOW())`,
          [s.id, 'renewal_due', message]
        );
        inserted++;
      }
    }

    res.json({ generated: inserted });
  } catch (err) {
    console.error('❌ generateNotifications error:', err.stack || err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
