require('dotenv').config();
const { Pool } = require('pg');

console.log("\n🔍 --- DIAGNOSTIC START ---");

// 1. Check what variables are actually loaded
const dbUrl = process.env.DATABASE_URL;
const localHost = process.env.DB_HOST;

if (dbUrl) {
    console.log("✅ DATABASE_URL is FOUND.");
    console.log("   Value starts with:", dbUrl.substring(0, 15) + "...");
    console.log("   Target Host:", dbUrl.split('@')[1].split('/')[0]);
} else {
    console.log("❌ DATABASE_URL is MISSING or UNDEFINED.");
}

if (localHost) {
    console.log("⚠️  Local DB_HOST is also defined:", localHost);
    console.log("   (This might be overriding your cloud settings if logic is wrong)");
}

// 2. Attempt Connection
console.log("\n🔄 Attempting Connection...");

// Use the exact logic we want: Cloud URL first
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("🛑 STOPPING: Cannot connect without a DATABASE_URL.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Required for Neon
});

pool.query('SELECT NOW() as now, current_user', (err, res) => {
    if (err) {
        console.error("❌ CONNECTION FAILED!");
        console.error("   Error:", err.message);
        if (err.message.includes('password')) {
            console.error("   💡 Hint: Check your password in the URL.");
        }
        if (err.message.includes('SSL')) {
            console.error("   💡 Hint: SSL is not enabled or supported.");
        }
    } else {
        console.log("✅ CONNECTION SUCCESSFUL!");
        console.log("   Time on Server:", res.rows[0].now);
        console.log("   Logged in as:", res.rows[0].current_user);
        console.log("   (If you see this, your .env and connection are PERFECT.)");
    }
    pool.end();
}); 