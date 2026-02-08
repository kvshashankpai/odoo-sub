const express = require('express');
const router = express.Router();
const recurringPriceController = require('../controllers/recurringPriceController');

// GET /api/recurring-prices/product/:productId
router.get('/product/:productId', recurringPriceController.getRecurringPrices);

// POST /api/recurring-prices/product/:productId
router.post('/product/:productId', recurringPriceController.createRecurringPrice);

// DELETE /api/recurring-prices/:priceId
router.delete('/:priceId', recurringPriceController.deleteRecurringPrice);

// PUT /api/recurring-prices/:priceId
router.put('/:priceId', recurringPriceController.updateRecurringPrice);

module.exports = router;
