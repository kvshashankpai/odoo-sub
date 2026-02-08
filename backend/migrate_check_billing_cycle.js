const db = require('./db');
require('dotenv').config();

async function migrate() {
    try {
        console.log('Running migration: ensure billing_cycle supports Weekly/Monthly/Yearly...');

        // Double check column existence (it should exist from previous migrations, but good to be safe)
        await db.query("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(50);");

        console.log('✅ Migration checked/completed');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message || err);
        process.exit(1);
    }
}

migrate();
