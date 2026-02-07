const express = require('express');
const router = express.Router();
const {
	createInvoice,
	updateInvoiceStatus,
	getInvoices,
	getInvoiceById,
} = require('../controllers/invoiceController');

// RESTful endpoints
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
// Update status (PATCH /api/invoices/:id/status)
router.patch('/:id/status', updateInvoiceStatus);

module.exports = router;