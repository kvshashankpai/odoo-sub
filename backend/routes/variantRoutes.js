const express = require('express');
const router = express.Router();
const variantController = require('../controllers/variantController');

// GET /api/products/:productId/variants
router.get('/product/:productId', variantController.getVariants);

// POST /api/variants/product/:productId
router.post('/product/:productId', variantController.createVariant);

// DELETE /api/variants/:variantId
router.delete('/:variantId', variantController.deleteVariant);

// PUT /api/variants/:variantId
router.put('/:variantId', variantController.updateVariant);

module.exports = router;
