const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const db = require('./db'); // ✅ Correct path (same folder)

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
// const productRoutes = require('./routes/productRoutes'); // Uncomment when you create this

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
// app.use('/api/products', productRoutes);

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
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  }
});