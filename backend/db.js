const { Pool } = require('pg');
require('dotenv').config();

// Detect if we are using the Cloud URL (Neon)
const isProduction = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false 
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};