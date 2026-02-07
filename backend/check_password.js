const db = require('./db');
const bcrypt = require('bcryptjs');

async function checkPassword() {
    try {
        const email = 'admin@odoo.com';
        const password = 'Admin@123';

        console.log(`Checking password for ${email}...`);
        const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (res.rows.length === 0) {
            console.log("User not found.");
            process.exit(1);
        }

        const user = res.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log("✅ Password match! 'Admin@123' is correct.");
        } else {
            console.log("❌ Password mismatch! The stored hash does NOT match 'Admin@123'.");

            // Update password
            console.log("Updating password to 'Admin@123'...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await db.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
            console.log("✅ Password updated successfully.");
        }
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkPassword();
