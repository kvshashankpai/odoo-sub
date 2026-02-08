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
const variantRoutes = require('./routes/variantRoutes');
const recurringPriceRoutes = require('./routes/recurringPriceRoutes');

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
// Variants & Recurring Prices
app.use('/api/variants', variantRoutes);
app.use('/api/recurring-prices', recurringPriceRoutes);

// --- ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("❌ Database Connection Failed:", err.stack);
  } else {
    console.log("✅ PostgreSQL Connected Successfully (Cloud/Local)");
    
    // Ensure subscriptions table has variant_id column
    const addVariantColumn = `
      ALTER TABLE subscriptions 
      ADD COLUMN IF NOT EXISTS variant_id INTEGER
    `;

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

    // Ensure product_variants table exists
    const createVariants = `
      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        additional_price NUMERIC(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Ensure recurring_prices table exists
    const createRecurringPrices = `
      CREATE TABLE IF NOT EXISTS recurring_prices (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        payment_mode VARCHAR(64) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        interval VARCHAR(64),
        min_qty INTEGER,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    db.query(addVariantColumn, (addColErr) => {
      if (addColErr && !addColErr.message.includes('already exists')) {
        console.error('⚠️ Note: variant_id column status:', addColErr.message);
      }

      db.query(createNotifications, (createErr1) => {
        if (createErr1) console.error('❌ Could not ensure notifications table:', createErr1.stack || createErr1);
        
        db.query(createVariants, (createErr2) => {
          if (createErr2) console.error('❌ Could not ensure product_variants table:', createErr2.stack || createErr2);
          
          db.query(createRecurringPrices, (createErr3) => {
            if (createErr3) console.error('❌ Could not ensure recurring_prices table:', createErr3.stack || createErr3);
            
            app.listen(PORT, () => {
              console.log(`🚀 Server running on http://localhost:${PORT}`);
            });
          });
        });
      });
    });
  }
});