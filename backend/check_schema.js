const db = require('./db');
const fs = require('fs');

async function checkSchema() {
    try {
        console.log('Checking schema for subscriptions table...');
        const res = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'subscriptions';
    `);
        fs.writeFileSync('schema_output.json', JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error checking schema:', err);
        process.exit(1);
    }
}

checkSchema();
