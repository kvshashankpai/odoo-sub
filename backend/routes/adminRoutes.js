const express = require('express');
const router = express.Router();
const { createInternalUser } = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST /api/admin/users - create an internal user (admin only)
router.post('/users', verifyToken, requireRole('admin'), createInternalUser);

module.exports = router;
