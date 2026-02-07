const db = require('./db');

async function init() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        cost DECIMAL(10,2) NOT NULL,
        type TEXT,
        recurring TEXT,
        UNIQUE KEY unique_name (name(191))
      );

      CREATE TABLE IF NOT EXISTS payments (
        ref VARCHAR(50) PRIMARY KEY,
        date VARCHAR(50),
        customer TEXT,
        amount DECIMAL(12,2),
        method TEXT,
        status TEXT
      );
    `);

    // Seed products
    const products = [
      { name: 'SaaS Basic', price: 29.0, cost: 5.0, type: 'Service', recurring: 'Monthly' },
      { name: 'SaaS Pro', price: 99.0, cost: 15.0, type: 'Service', recurring: 'Monthly' },
      { name: 'Implementation Fee', price: 500.0, cost: 200.0, type: 'Service', recurring: 'One-time' },
    ];

    for (const p of products) {
      await db.query(
        `INSERT IGNORE INTO products (name, price, cost, type, recurring)
         VALUES (?,?,?,?,?)`,
        [p.name, p.price, p.cost, p.type, p.recurring]
      );
    }

    // Seed payments
    const payments = [
      { ref: 'PAY/001', date: 'Oct 24, 2023', customer: 'Acme Corp', amount: 113.85, method: 'Stripe', status: 'Posted' },
      { ref: 'PAY/002', date: 'Oct 23, 2023', customer: 'Globex Inc', amount: 99.0, method: 'Bank Wire', status: 'Posted' },
      { ref: 'PAY/003', date: 'Oct 22, 2023', customer: 'Soylent Corp', amount: 29.0, method: 'PayPal', status: 'Pending' },
    ];

    for (const p of payments) {
      await db.query(
        `INSERT IGNORE INTO payments (ref, date, customer, amount, method, status)
         VALUES (?,?,?,?,?,?)`,
        [p.ref, p.date, p.customer, p.amount, p.method, p.status]
      );
    }

    console.log('Database initialized and seeded.');
    process.exit(0);
  } catch (err) {
    console.error('DB init failed:', err);
    process.exit(1);
  }
}

init();
