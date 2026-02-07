const db = require('../db');

// Process a Payment
exports.processPayment = async (req, res) => {
    const { invoice_id, amount, payment_method, notes } = req.body;
    
    try {
        // 1. Record the payment
        const paymentResult = await db.query(
            'INSERT INTO payments (invoice_id, amount, payment_method, payment_date, notes) VALUES ($1, $2, $3, NOW(), $4) RETURNING *',
            [invoice_id, amount, payment_method, notes]
        );

        // 2. Update Invoice Status to 'Paid' (Simple logic for now)
        await db.query('UPDATE invoices SET status = $1 WHERE id = $2', ['Paid', invoice_id]);

        res.status(201).json(paymentResult.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Payment History
exports.getPaymentHistory = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM payments ORDER BY payment_date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};