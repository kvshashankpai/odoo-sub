const db = require('../db');

// 1. GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error fetching products:", err);
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

// 2. GET PRODUCT BY ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error fetching product:", err);
        res.status(500).json({ error: "Failed to fetch product" });
    }
};

// 3. CREATE PRODUCT
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, cost, type, recurring } = req.body;

        // Validate required fields
        if (!name || !price) {
            return res.status(400).json({ error: "Name and price are required" });
        }

        // Check if product already exists
        const existingProduct = await db.query('SELECT * FROM products WHERE name = $1', [name]);
        if (existingProduct.rows.length > 0) {
            return res.status(400).json({ error: "Product already exists" });
        }

        // Insert new product
        const result = await db.query(
            'INSERT INTO products (name, description, price, cost, type, recurring) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description || null, price, cost || null, type || null, recurring || null]
        );

        res.status(201).json({ success: true, product: result.rows[0] });
    } catch (err) {
        console.error("❌ Error creating product:", err);
        res.status(500).json({ error: "Failed to create product" });
    }
};

// 4. UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, cost, type, recurring } = req.body;

        // Check if product exists
        const existingProduct = await db.query('SELECT * FROM products WHERE id = $1', [id]);
        if (existingProduct.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Update product
        const result = await db.query(
            'UPDATE products SET name = $1, description = $2, price = $3, cost = $4, type = $5, recurring = $6 WHERE id = $7 RETURNING *',
            [name || existingProduct.rows[0].name, description !== undefined ? description : existingProduct.rows[0].description, 
             price || existingProduct.rows[0].price, cost !== undefined ? cost : existingProduct.rows[0].cost, 
             type || existingProduct.rows[0].type, recurring || existingProduct.rows[0].recurring, id]
        );

        res.json({ success: true, product: result.rows[0] });
    } catch (err) {
        console.error("❌ Error updating product:", err);
        res.status(500).json({ error: "Failed to update product" });
    }
};

// 5. DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if product exists
        const existingProduct = await db.query('SELECT * FROM products WHERE id = $1', [id]);
        if (existingProduct.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Delete product
        await db.query('DELETE FROM products WHERE id = $1', [id]);

        res.json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting product:", err);
        res.status(500).json({ error: "Failed to delete product" });
    }
};