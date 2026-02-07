const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET all products
router.get('/', productController.getProducts);

// GET product by ID
router.get('/:id', productController.getProductById);

// CREATE new product
router.post('/', productController.createProduct);

// UPDATE product by ID
router.put('/:id', productController.updateProduct);

// DELETE product by ID
router.delete('/:id', productController.deleteProduct);

module.exports = router;
