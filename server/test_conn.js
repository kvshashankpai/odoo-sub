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
    const rows = await db.query('SELECT 1 AS ok');
    console.log('Query result:', rows);
    console.log('DB connection OK');
    process.exit(0);
  } catch (err) {
    console.error('DB connection test failed:');
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

test();
