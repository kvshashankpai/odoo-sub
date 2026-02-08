const db = require('./db');

async function check() {
    const tables = ['subscriptions', 'products', 'product_variants'];
    for (const t of tables) {
        try {
            const res = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${t}'`);
            console.log(`${t}: ${res.rows.map(r => r.column_name).join(', ')}`);
        } catch (e) {
            console.log(`${t}: Error ${e.message}`);
        }
    }
    process.exit(0);
}
check();
