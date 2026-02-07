const db = require('../db');
const bcrypt = require('bcryptjs');

// Admin creates an internal user
exports.createInternalUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    // Check existing
    const exists = await db.query('SELECT id, email FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name || null, email, hashed, 'internal']
    );

    const created = result.rows[0];

    // Return the created user (no password)
    res.status(201).json({ success: true, user: created });
  } catch (err) {
    console.error('Admin createInternalUser error', err);
    res.status(500).json({ error: 'Server error creating internal user' });
  }
};
