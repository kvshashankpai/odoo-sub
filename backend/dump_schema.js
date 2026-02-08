const fs = require('fs');
const db = require('./db');

async function dumpSchema() {
    try {
        const tables = ['subscriptions', 'products', 'product_variants'];
        let output = '';
        for (const t of tables) {
            const res = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t}'`);
            output += `\n--- Columns in '${t}' table ---\n`;
            if (res.rows.length === 0) {
                output += `(Table '${t}' not found or has no columns)\n`;
            } else {
                res.rows.forEach(row => {
                    output += `- ${row.column_name} (${row.data_type})\n`;
                });
            }
        }
        fs.writeFileSync('schema_dump.txt', output);
        console.log('Schema dumped to schema_dump.txt');
        process.exit(0);
    } catch (err) {
        console.error("Error checking schema:", err);
        process.exit(1);
    }
}

dumpSchema();
