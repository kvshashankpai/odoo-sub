const db = require('../db');

// Fetch notifications (all) - used by admin pages
exports.getNotifications = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM notifications ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ getNotifications error:', err.stack || err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Fetch notifications for the logged in user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });
    const result = await db.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ getUserNotifications error:', err.stack || err.message);
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
// Associates the notification with the subscription's user_id when possible
// Internal helper: generate notifications and return how many were inserted
async function generateNotificationsInternal() {
  // Prefer using subscriptions.next_billing_date if available.
  const colCheck = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='next_billing_date' LIMIT 1");
  let subs = [];

  if (colCheck.rows.length > 0) {
    // subscriptions has next_billing_date column
    const query = `
      SELECT s.id, u.name as customer_name, s.next_billing_date, s.user_id
      FROM subscriptions s
      LEFT JOIN users u ON u.id = s.user_id
      WHERE s.next_billing_date IS NOT NULL
        AND s.status = 'confirmed'
        AND s.next_billing_date <= NOW() + INTERVAL '7 days'
        AND s.next_billing_date >= NOW()
    `;
    subs = (await db.query(query)).rows;
  } else {
    // Fallback: find invoices with due_date in next 7 days (pending invoices)
    const invQuery = `
      SELECT i.subscription_id AS id, u.name as customer_name, i.due_date AS next_billing_date, s.user_id
      FROM invoices i
      LEFT JOIN subscriptions s ON s.id = i.subscription_id
      LEFT JOIN users u ON u.id = i.user_id
      WHERE i.due_date IS NOT NULL
        AND i.status IN ('pending','due')
        AND i.due_date <= NOW() + INTERVAL '7 days'
        AND i.due_date >= NOW()
    `;
    subs = (await db.query(invQuery)).rows;
  }

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
        `INSERT INTO notifications (subscription_id, user_id, type, message, is_read, created_at) VALUES ($1, $2, $3, $4, false, NOW())`,
        [s.id, s.user_id || null, 'renewal_due', message]
      );
      inserted++;
    }
  }

  return inserted;
}

// HTTP handler wrapper
exports.generateNotifications = async (req, res) => {
  try {
    const generated = await generateNotificationsInternal();
    res.json({ generated });
  } catch (err) {
    console.error('❌ generateNotifications error:', err.stack || err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Export internal for server-side scheduling
exports.generateNotificationsInternal = generateNotificationsInternal;

// Broadcast a notification to all users (admin only)
exports.broadcastNotifications = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim().length === 0) return res.status(400).json({ error: 'Message is required' });

    // Fetch all user ids
    const users = (await db.query('SELECT id FROM users')).rows;
    let inserted = 0;
    for (const u of users) {
      await db.query(
        `INSERT INTO notifications (user_id, type, message, is_read, created_at) VALUES ($1, $2, $3, false, NOW())`,
        [u.id, 'broadcast', message]
      );
      inserted++;
    }

    res.json({ broadcasted: inserted });
  } catch (err) {
    console.error('❌ broadcastNotifications error:', err.stack || err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
