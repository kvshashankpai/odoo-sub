const db = require('../db');

// Fetch all invoices
exports.getInvoices = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT i.*, u.name as customer_name, s.subscription_number
            FROM invoices i
            JOIN subscriptions s ON i.subscription_id = s.id
            JOIN users u ON s.customer_id = u.id
            ORDER BY i.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Fetch a single invoice
exports.getInvoiceById = async (req, res) => {
    const { id } = req.params;
    try {
        const invoice = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);
        if (invoice.rows.length === 0) return res.status(404).json({ error: "Invoice not found" });

        // If you have line items, fetch them here. 
        // For now, returning the invoice details.
        res.json(invoice.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Invoice from Subscription
exports.createInvoice = async (req, res) => {
    const { subscriptionId } = req.body;

    try {
        // 1. Fetch Subscription details
        const subResult = await db.query('SELECT * FROM subscriptions WHERE id = $1', [subscriptionId]);
        const subscription = subResult.rows[0];

        if (!subscription) return res.status(404).json({ error: "Subscription not found" });

        // 2. Generate Invoice Data
        const invoiceNumber = `INV-${Date.now()}`;
        const amount = subscription.total_amount;

        // 3. Insert Invoice (Start in 'draft' state)
        const insertQuery = `
            INSERT INTO invoices (subscription_id, invoice_number, amount, status, issue_date)
            VALUES ($1, $2, $3, 'draft', NOW())
            RETURNING *`;
            
        const newInvoice = await db.query(insertQuery, [subscription.id, invoiceNumber, amount]);

        res.status(201).json({
            success: true,
            invoice: newInvoice.rows[0],
            redirectUrl: `/invoices/draft/${newInvoice.rows[0].id}`
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Invoice Status (Confirm, Cancel, Reset)
exports.updateInvoiceStatus = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'confirm', 'cancel', 'reset_to_draft'

    try {
        let newStatus;
        switch (action) {
            case 'confirm':
                newStatus = 'confirmed';
                break;
            case 'cancel':
                newStatus = 'cancelled';
                break;
            case 'reset_to_draft':
                newStatus = 'draft'; // Brings it back to draft for editing
                break;
            default:
                return res.status(400).json({ error: "Invalid Action" });
        }

        const result = await db.query(
            'UPDATE invoices SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [newStatus, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};