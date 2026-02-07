const { Pool } = require('pg');
require('dotenv').config();

// Debugging: Check if URL is loaded (Don't log the full password!)
if (!process.env.DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL is missing in .env file");
  process.exit(1);
} else {
  console.log("Database URL found, attempting connection...");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // REQUIRED for Neon
  },
  connectionTimeoutMillis: 5000, // Fail if can't connect in 5 seconds
});

// Test the connection immediately
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error acquiring client', err.stack);
  } else {
    console.log('✅ Connected to Neon PostgreSQL database successfully');
    release();
  }
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};