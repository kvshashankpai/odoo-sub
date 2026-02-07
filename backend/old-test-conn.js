// OLD MYSQL CONNECTION TEST (ARCHIVED - kept for reference)
require('dotenv').config();
const db = require('./db');

function mask(s) {
  if (!s) return s;
  return s.slice(0, 1) + '***' + s.slice(-1);
}

async function test() {
  try {
    // parse DATABASE_URL for display
    const raw = process.env.DATABASE_URL || '';
    let info = { raw };
    try {
      const u = new URL(raw);
      info = {
        protocol: u.protocol,
        host: u.hostname,
        port: u.port || '(default)',
        user: u.username,
        database: u.pathname ? u.pathname.replace(/^\//, '') : undefined,
        password: mask(u.password || ''),
      };
    } catch (e) {
      // ignore
    }

    console.log('Using DATABASE_URL:', info);

    console.log('Attempting simple query: SELECT 1');
    const result = await db.query('SELECT 1 as result');
    console.log('✅ Success:', result);

    console.log('Fetching products...');
    const products = await db.query('SELECT * FROM products LIMIT 5');
    console.log('✅ Products:', products);

  } catch (err) {
    console.error('❌ Connection failed:', err.code, err.message);
  }
}

test();
