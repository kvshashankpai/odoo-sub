const db = require('./db');
require('dotenv').config();

async function migrate() {
  try {
    console.log('Checking invoices table columns...');
    const colRes = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name='invoices'");
    const cols = colRes.rows.map(r => r.column_name);

    if (!cols.includes('amount')) {
      console.log('Adding amount column to invoices...');
      await db.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2);");

      if (cols.includes('total_amount')) {
        console.log('Populating amount from total_amount...');
        await db.query("UPDATE invoices SET amount = COALESCE(total_amount, 0) WHERE amount IS NULL;");
      }

      console.log('Migration completed. amount column is present.');
    } else {
      console.log('amount column already exists. Nothing to do.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    process.exit(1);
  }
}

migrate();
