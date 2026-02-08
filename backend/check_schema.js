const db = require('./db');

async function checkSchema() {
    try {
        const tables = ['subscriptions', 'products', 'product_variants'];
        for (const table of tables) {
            console.log(`\n--- Columns in '${table}' table ---`);
            const res = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
            if (res.rows.length === 0) {
                console.log(`(Table '${table}' not found or has no columns)`);
            } else {
                res.rows.forEach(row => {
                    console.log(`- ${row.column_name} (${row.data_type})`);
                });
            }
        }
        process.exit(0);
    } catch (err) {
        console.error("Error checking schema:", err);
        process.exit(1);
    }
}

checkSchema();
