const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const db = require('./db'); 

// --- IMPORT CONTROLLERS & ROUTES ---
const authRoutes = require('./routes/authRoutes'); // <--- NEW
const subController = require('./controllers/subscriptionController');
// const productController = ... (Import other controllers as needed)
// const invoiceController = ...

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(bodyParser.json()); 

// --- ROOT ROUTE ---
app.get('/', (req, res) => {
  res.send('API is running...');
});

// --- API ROUTES ---

// 1. Authentication Routes
app.use('/api/auth', authRoutes); 
// This creates: 
// POST http://localhost:5000/api/auth/signup
// POST http://localhost:5000/api/auth/login

// 2. Subscription Routes (Direct Controller Usage for simplicity or import Router)
app.get('/api/subscriptions', subController.getSubscriptions);
app.post('/api/subscriptions', subController.createSubscription);
app.patch('/api/subscriptions/:id/status', subController.updateStatus); 

// --- DATABASE CHECK & START SERVER ---
// Test database connection
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("❌ Database Connection Failed:", err.message);
  } else {
    console.log("✅ PostgreSQL Connected Successfully");
  }
});

// Start server regardless of DB connection
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});