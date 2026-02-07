const db = require('./db');
require('dotenv').config();

async function migrate() {
  try {
    console.log('Checking subscriptions table columns for parent_subscription_id...');
    const colRes = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name='subscriptions'");
    const cols = colRes.rows.map(r => r.column_name);

    if (!cols.includes('parent_subscription_id')) {
      console.log('Adding parent_subscription_id column to subscriptions...');
      await db.query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS parent_subscription_id INTEGER REFERENCES subscriptions(id);
      `);
      console.log('Migration completed. parent_subscription_id column is present.');
    } else {
      console.log('parent_subscription_id already exists. Nothing to do.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    process.exit(1);
  }
}

migrate();
