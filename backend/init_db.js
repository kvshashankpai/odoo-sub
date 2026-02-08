const db = require('./db');
require('dotenv').config();

async function initializeDatabase() {
  try {
    console.log('Initializing PostgreSQL database...');

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Create products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        cost DECIMAL(10,2),
        type VARCHAR(50),
        recurring VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Products table created');

    // Create subscriptions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id),
        status VARCHAR(50) DEFAULT 'active',
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Subscriptions table created');

    // Create invoices table
    await db.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        subscription_id INTEGER REFERENCES subscriptions(id),
        amount DECIMAL(12,2),
        status VARCHAR(50) DEFAULT 'pending',
        issued_date DATE,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Invoices table created');

    // Create payments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER REFERENCES invoices(id),
        amount DECIMAL(12,2),
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        transaction_id VARCHAR(255),
        paid_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Payments table created');

    // Create discounts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS discounts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        value DECIMAL(12,2) NOT NULL,
        min_purchase DECIMAL(12,2) DEFAULT 0,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Discounts table created');

    console.log('✅ Database initialization completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  }
}

initializeDatabase();
