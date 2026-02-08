const db = require('./db');
require('dotenv').config();

async function migrate() {
    try {
        console.log('Running migration: add product_id and parent_subscription_id...');

        await db.query("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id);");
        await db.query("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS parent_subscription_id INTEGER REFERENCES subscriptions(id);");

        console.log('✅ Migration completed: added product_id and parent_subscription_id');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message || err);
        process.exit(1);
    }
}

migrate();
