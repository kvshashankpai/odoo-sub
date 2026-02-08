const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

// GET /api/notifications
router.get('/', notificationsController.getNotifications);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', notificationsController.markRead);

// POST /api/notifications/generate
router.post('/generate', notificationsController.generateNotifications);

module.exports = router;
