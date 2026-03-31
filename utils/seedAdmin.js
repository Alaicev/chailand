const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const seedAdmin = async () => {
  try {
    // Проверяем есть ли пользователи
    const result = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(result.rows[0].count);

    if (userCount > 0) {
      console.log('Users already exist, skipping admin creation');
      return;
    }

    console.log('No users found. Creating admin...');

    const hashedPassword = await bcrypt.hash('qwerty123', 10);

    await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4)`,
      ['Admin', 'admin@example.com', hashedPassword, 'admin']
    );

    console.log('✅ Admin user created!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: qwerty123');

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  }
};

module.exports = seedAdmin;