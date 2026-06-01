const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'coffee_thing',
  });

  try {
    const [rows] = await connection.query('SELECT COUNT(*) as cnt FROM products');
    console.log('Products count:', rows[0].cnt);
    const [sample] = await connection.query('SELECT id, name, price, category FROM products LIMIT 10');
    console.log('Sample rows:', sample);
  } catch (err) {
    console.error('Error querying DB:', err.message);
  } finally {
    await connection.end();
  }
})();
