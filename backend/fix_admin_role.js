const db = require('./db');
require('dotenv').config();

async function fixAdminRole() {
  try {
    console.log('Fixing admin@odoo.com role...');

    // Update admin@odoo.com role to admin
    const result = await db.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, name, email, role',
      ['admin', 'admin@odoo.com']
    );

    if (result.rows.length > 0) {
      console.log('✅ Admin user role updated successfully');
      console.log('User:', result.rows[0]);
    } else {
      console.log('❌ User not found');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating admin role:', err.message);
    process.exit(1);
  }
}

fixAdminRole();
