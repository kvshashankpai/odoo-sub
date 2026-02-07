const db = require('./db');

async function checkUser() {
    try {
        console.log("Checking for admin user...");
        const res = await db.query("SELECT * FROM users WHERE email = 'admin@odoo.com'");
        if (res.rows.length > 0) {
            console.log("User found:", res.rows[0]);
        } else {
            console.log("User 'admin@odoo.com' not found.");
        }
        process.exit(0);
    } catch (err) {
        console.error("Error checking user:", err);
        process.exit(1);
    }
}

checkUser();
