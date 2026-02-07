const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import Controllers
const productController = require('./controllers/productController');
const subController = require('./controllers/subscriptionController');

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors()); // Allow React Frontend to access this API
app.use(bodyParser.json()); // Parse JSON bodies (e.g., POST requests)

// --- ROOT ROUTE (The "Home Page" of your Backend) ---
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
      <h1 style="color: #714B67;">✅ Subscription Management API is Running!</h1>
      <p>Status: <strong>Connected</strong></p>
      <p>Port: <strong>${PORT}</strong></p>
      <hr style="width: 50%; margin: 20px auto;">
      <h3>Available Endpoints:</h3>
      <p><a href="/api/products">/api/products</a> (GET)</p>
      <p><a href="/api/subscriptions">/api/subscriptions</a> (GET)</p>
    </div>
  `);
});

// --- API ROUTES ---

// 1. Product Routes
app.get('/api/products', productController.getProducts);
app.post('/api/products', productController.createProduct);

// 2. Subscription Routes
app.get('/api/subscriptions', subController.getSubscriptions);
app.post('/api/subscriptions', subController.createSubscription);
app.put('/api/subscriptions/:id/status', subController.updateStatus); // For Confirm/Close buttons

// --- ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`   (Database connection status will appear below)\n`);
});