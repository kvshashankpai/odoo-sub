const mysql = require('mysql2/promise');

// Support DATABASE_URL like: mysql://user:pass@host:port/db
const databaseUrl = process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/subscription_app';

function parseDatabaseUrl(url) {
  try {
    const u = new URL(url);
    if (!u.protocol || !u.protocol.startsWith('mysql')) {
      throw new Error(`Unsupported protocol in DATABASE_URL: ${u.protocol}. Use a MySQL URL like mysql://user:pass@host:3306/db`);
    }
    return {
      host: u.hostname,
      port: u.port || 3306,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname ? u.pathname.replace(/^\//, '') : undefined,
    };
  } catch (err) {
    console.error('Failed to parse DATABASE_URL:', err.message || err);
    return null;
  }
}

const cfg = parseDatabaseUrl(databaseUrl) || { host: 'localhost', user: 'root', password: 'root', database: 'subscription_app', port: 3306 };

const pool = mysql.createPool({
  host: cfg.host,
  port: cfg.port,
  user: cfg.user,
  password: cfg.password,
  database: cfg.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = {
  query: async (sql, params) => {
    const [rows] = await pool.query(sql, params);
    return rows;
  },
  pool,
};
