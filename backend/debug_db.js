const db = require('./db');

async function debugSchema() {
    try {
        const res = await db.query("SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name='subscriptions'");
        console.log('Subscriptions Columns:');
        res.rows.forEach(r => console.log(`${r.column_name} (${r.data_type})`));
        process.exit(0);
    } catch (err) {
        console.error('Error fetching schema:', err.message);
        process.exit(1);
    }
}

debugSchema();
