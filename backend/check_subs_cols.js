const db = require('./db');

async function check() {
    try {
        const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'subscriptions'");
        console.log(`subscriptions columns: ${res.rows.map(r => r.column_name).join(', ')}`);
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
    process.exit(0);
}
check();
