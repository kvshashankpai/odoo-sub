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
                const amount = subscription.total_amount || subscription.amount || 0;

                // 3. Inspect invoice table columns and build an INSERT that matches the schema
                // This avoids failures when the invoices table uses a different column name (e.g., total_amount)
                const wantedCols = ['subscription_id','invoice_number','amount','total_amount','total','status','issue_date','issued_date','created_at','updated_at'];
                const colsRes = await db.query(
                    `SELECT column_name FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = ANY($1::text[])`,
                    [wantedCols]
                );

                const present = colsRes.rows.map(r => r.column_name);

                // Determine which amount column exists
                let amountCol = null;
                if (present.includes('amount')) amountCol = 'amount';
                else if (present.includes('total_amount')) amountCol = 'total_amount';
                else if (present.includes('total')) amountCol = 'total';

                // Determine issue/issued date column
                let issueDateCol = null;
                if (present.includes('issue_date')) issueDateCol = 'issue_date';
                else if (present.includes('issued_date')) issueDateCol = 'issued_date';
                else if (present.includes('created_at')) issueDateCol = 'created_at';

                // Build insert columns and values
                const insertCols = [];
                const placeholders = [];
                const values = [];

                // subscription_id should exist in most schemas
                if (present.includes('subscription_id')) {
                    insertCols.push('subscription_id');
                    placeholders.push(`$${placeholders.length + 1}`);
                    values.push(subscription.id);
                }

                if (present.includes('invoice_number')) {
                    insertCols.push('invoice_number');
                    placeholders.push(`$${placeholders.length + 1}`);
                    values.push(invoiceNumber);
                }

                if (amountCol) {
                    insertCols.push(amountCol);
                    placeholders.push(`$${placeholders.length + 1}`);
                    values.push(amount);
                }

                if (present.includes('status')) {
                    insertCols.push('status');
                    placeholders.push(`$${placeholders.length + 1}`);
                    values.push('draft');
                }

                if (issueDateCol) {
                    // If created_at exists and other issue cols don't, only set created_at if it's allowed
                    if (issueDateCol === 'created_at') {
                        // Skip setting created_at to allow default CURRENT_TIMESTAMP unless explicitly desired
                    } else {
                        insertCols.push(issueDateCol);
                        placeholders.push(`$${placeholders.length + 1}`);
                        values.push(new Date());
                    }
                }

                if (insertCols.length === 0) {
                    return res.status(500).json({ error: 'No writable columns found in invoices table' });
                }

                const insertQuery = `INSERT INTO invoices (${insertCols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`;
                const newInvoice = await db.query(insertQuery, values);

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