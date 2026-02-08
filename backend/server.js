const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const db = require('./db'); // ✅ Correct path (same folder)

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const productRoutes = require('./routes/productRoutes');
const discountRoutes = require('./routes/discountRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(bodyParser.json()); 

// --- ROOT ROUTE ---
app.get('/', (req, res) => {
  res.send('✅ Subscription Management API is Running!');
});

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/admin', adminRoutes);
// Notifications
app.use('/api/notifications', notificationsRoutes);

// --- ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// --- DATABASE CHECK & START SERVER ---
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("❌ Database Connection Failed:", err.stack);
  } else {
    console.log("✅ PostgreSQL Connected Successfully (Cloud/Local)");
    // Ensure notifications table exists
    const createNotifications = `
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        subscription_id INTEGER,
        type VARCHAR(64),
        message TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    db.query(createNotifications, (createErr) => {
      if (createErr) console.error('❌ Could not ensure notifications table:', createErr.stack || createErr);
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    });
  }
});