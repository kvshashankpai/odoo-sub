const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'odoo_sub_db',
  password: String(process.env.DB_PASSWORD || 'postgres'),
  port: parseInt(process.env.DB_PORT || 5432),
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};