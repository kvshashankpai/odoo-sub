const db = require('../db');

exports.getSubscriptions = async (req, res) => {
    try {
        const query = `
            SELECT * FROM subscriptions 
            ORDER BY created_at DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSubscriptionById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM subscriptions WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Subscription not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createSubscription = async (req, res) => {
    const { customer_name, billing_cycle, start_date, total_amount } = req.body;

    try {
        console.log('📥 createSubscription body:', req.body);

        if (!customer_name) {
            return res.status(400).json({ error: "Customer Name is required" });
        }

        const result = await db.query(
            'INSERT INTO subscriptions (customer_name, billing_cycle, start_date, total_amount, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
            [customer_name, billing_cycle || 'Monthly', start_date || null, total_amount || 0, 'draft']
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('❌ createSubscription error:', err.stack || err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    try {
        let newStatus;
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
                newStatus = req.body.status;
        }

        if (!newStatus) {
            return res.status(400).json({ error: "Invalid action or status" });
        }

        const result = await db.query(
            'UPDATE subscriptions SET status = $1 WHERE id = $2 RETURNING *',
            [newStatus, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSubscription = async (req, res) => {
    const { id } = req.params;
    const fields = ['customer_name','billing_cycle','start_date','total_amount','product_id','user_id','status'];
    const setClauses = [];
    const values = [];

    // Get existing columns to avoid referencing missing columns
    let existingCols = [];
    try {
        const colRes = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name='subscriptions'");
        existingCols = colRes.rows.map(r => r.column_name);
    } catch (err) {
        console.warn('Could not fetch subscriptions columns:', err.message || err);
    }

    for (const f of fields) {
        if (Object.prototype.hasOwnProperty.call(req.body, f)) {
            if (existingCols.length === 0 || existingCols.includes(f)) {
                values.push(req.body[f]);
                setClauses.push(`${f} = $${values.length}`);
            }
        }
    }

    if (setClauses.length === 0) return res.status(400).json({ error: 'No fields provided to update' });

    const includeUpdatedAt = existingCols.includes('updated_at');
    const updatedAtClause = includeUpdatedAt ? ', updated_at = NOW()' : '';
    const query = `UPDATE subscriptions SET ${setClauses.join(', ')}${updatedAtClause} WHERE id = $${values.length + 1} RETURNING *`;
    values.push(id);

    try {
        const result = await db.query(query, values);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Subscription not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ updateSubscription error:', err.stack || err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};