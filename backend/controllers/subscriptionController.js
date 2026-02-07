const db = require('../db');

exports.getSubscriptions = async (req, res) => {
    try {
        const query = `
            SELECT s.*, u.name as customer_name, p.plan_name 
            FROM subscriptions s
            JOIN users u ON s.customer_id = u.id
            JOIN recurring_plans p ON s.plan_id = p.id
            ORDER BY s.created_at DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createSubscription = async (req, res) => {
    // Added total_amount to body so we can save it for invoicing later
    const { customer_id, plan_id, start_date, total_amount } = req.body;
    
    const subNumber = `SUB-${Date.now()}`; 

    try {
        const result = await db.query(
            'INSERT INTO subscriptions (subscription_number, customer_id, plan_id, start_date, total_amount, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [subNumber, customer_id, plan_id, start_date, total_amount || 0, 'draft'] // Default to 'draft'
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // Expecting: 'send_quotation', 'confirm', 'cancel'

    try {
        let newStatus;
        
        // State Machine Logic
        switch (action) {
            case 'send_quotation':
                newStatus = 'quotation_sent';
                break;
            case 'confirm':
                newStatus = 'confirmed';
                break;
            case 'cancel':
                newStatus = 'cancelled';
                break;
            default:
                // Fallback if raw status string is sent
                newStatus = req.body.status;
        }

        if (!newStatus) {
            return res.status(400).json({ error: "Invalid action or status" });
        }

        const result = await db.query(
            'UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [newStatus, id]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};