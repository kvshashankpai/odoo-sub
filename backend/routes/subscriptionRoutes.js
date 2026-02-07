const express = require('express');
const router = express.Router();
// Import the controller that contains the logic for creating subs and updating status
const subController = require('../controllers/subscriptionController');

// GET /api/subscriptions
// Fetch all subscriptions (Drafts, Confirmed, etc.)
router.get('/', subController.getSubscriptions);

// POST /api/subscriptions
// Create a new Subscription (Defaults to 'Draft' status)
router.post('/', subController.createSubscription);

// PATCH /api/subscriptions/:id/status
// Handles the logic for:
// - "Send Quotation" button -> sets status to 'quotation_sent'
// - "Confirm" button -> sets status to 'confirmed'
// - "Cancel" button -> sets status to 'cancelled'
router.patch('/:id/status', subController.updateStatus);

module.exports = router;