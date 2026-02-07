const db = require('./db');
require('dotenv').config();

async function migrate() {
  try {
    console.log('Running migration: add subscription fields if missing...');

    await db.query("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);");
    await db.query("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(50);");
    await db.query("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) DEFAULT 0;");

    console.log('✅ Migration completed: columns added (if they did not exist)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message || err);
    process.exit(1);
  }
}

migrate();
