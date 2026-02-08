const express = require('express');
const router = express.Router();
const { createInternalUser, getAllUsers } = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST /api/admin/users - create an internal user (admin only)
router.post('/users', verifyToken, requireRole('admin'), createInternalUser);

// GET /api/admin/users - get all users
router.get('/users', verifyToken, requireRole('admin'), getAllUsers);

module.exports = router;
