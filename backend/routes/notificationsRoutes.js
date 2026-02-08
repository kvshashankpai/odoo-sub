const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { verifyToken, requireRole } = require('../middleware/auth');


// GET /api/notifications - admin/all notifications (keeps backward-compat)
router.get('/', notificationsController.getNotifications);

// GET /api/notifications/user - logged-in user's notifications
router.get('/user', verifyToken, notificationsController.getUserNotifications);

// PATCH /api/notifications/:id/read - mark read (authenticated)
router.patch('/:id/read', verifyToken, notificationsController.markRead);

// POST /api/notifications/generate - generate renewal due notifications (admin/internal)
router.post('/generate', verifyToken, requireRole('admin', 'internal'), notificationsController.generateNotifications);

// POST /api/notifications/broadcast - admin creates a message for all users
router.post('/broadcast', verifyToken, requireRole('admin'), notificationsController.broadcastNotifications);

module.exports = router;
