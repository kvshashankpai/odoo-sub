const express = require('express');
const router = express.Router();
const { createInvoice, updateInvoiceStatus } = require('../controllers/invoiceController');

router.post('/create', createInvoice);
router.post('/update-status', updateInvoiceStatus);

module.exports = router;