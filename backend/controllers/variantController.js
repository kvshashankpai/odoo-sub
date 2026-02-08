const db = require('../db');

// Get all variants for a product
exports.getVariants = async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await db.query('SELECT * FROM product_variants WHERE product_id = $1 ORDER BY id ASC', [productId]);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching variants:', err);
    res.status(500).json({ error: 'Failed to fetch variants' });
  }
};

// Create a variant
exports.createVariant = async (req, res) => {
  const { productId } = req.params;
  const { name, description, additional_price } = req.body;
  
  try {
    if (!name) {
      return res.status(400).json({ error: 'Variant name is required' });
    }

    const result = await db.query(
      'INSERT INTO product_variants (product_id, name, description, additional_price) VALUES ($1, $2, $3, $4) RETURNING *',
      [productId, name, description || null, additional_price || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error creating variant:', err);
    res.status(500).json({ error: 'Failed to create variant' });
  }
};

// Delete a variant
exports.deleteVariant = async (req, res) => {
  const { variantId } = req.params;
  
  try {
    const result = await db.query('DELETE FROM product_variants WHERE id = $1 RETURNING *', [variantId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    res.json({ success: true, deleted: result.rows[0] });
  } catch (err) {
    console.error('❌ Error deleting variant:', err);
    res.status(500).json({ error: 'Failed to delete variant' });
  }
};

// Update a variant
exports.updateVariant = async (req, res) => {
  const { variantId } = req.params;
  const { name, description, additional_price } = req.body;
  
  try {
    const result = await db.query(
      'UPDATE product_variants SET name = $1, description = $2, additional_price = $3 WHERE id = $4 RETURNING *',
      [name, description, additional_price, variantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error updating variant:', err);
    res.status(500).json({ error: 'Failed to update variant' });
  }
};
