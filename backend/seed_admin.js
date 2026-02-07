const db = require('./db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedUsers() {
  try {
    console.log('Creating test users...');

    // Users to seed
    const users = [
      { name: 'Admin User', email: 'admin@odoo.com', password: 'Admin@123', role: 'admin' },
      { name: 'Internal User', email: 'internal@odoo.com', password: 'Internal@123', role: 'internal' },
      { name: 'Test Customer', email: 'customer@example.com', password: 'Customer@123', role: 'customer' }
    ];

    for (const userData of users) {
      // Check if user exists
      const existing = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [userData.email]
      );

      if (existing.rows.length > 0) {
        console.log(`✓ User "${userData.email}" already exists (${existing.rows[0].role})`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user
      const result = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [userData.name, userData.email, hashedPassword, userData.role]
      );

      console.log(`✅ Created ${userData.role} user: ${userData.email}`);
    }

    console.log('\n📋 Test Users Summary:');
    console.log('─────────────────────────────────────────');
    console.log('1. ADMIN USER:');
    console.log('   Email: admin@odoo.com');
    console.log('   Password: Admin@123');
    console.log('   Role: admin');
    console.log('\n2. INTERNAL USER:');
    console.log('   Email: internal@odoo.com');
    console.log('   Password: Internal@123');
    console.log('   Role: internal');
    console.log('\n3. CUSTOMER USER:');
    console.log('   Email: customer@example.com');
    console.log('   Password: Customer@123');
    console.log('   Role: customer');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding users:', err.message);
    process.exit(1);
  }
}

seedUsers();
