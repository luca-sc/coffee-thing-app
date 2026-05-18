/**
 * tests/setup.js
 * ---------------------------------------------------------------------
 * Utilitar pentru pregatirea bazei de date de TEST inainte de fiecare
 * suita de teste de integrare.
 *
 * resetDatabase() goleste toate tabelele si reinsereaza datele de baza,
 * astfel incat fiecare suita de teste sa porneasca de la o stare curata.
 *
 * IMPORTANT: aceste teste folosesc baza de date 'coffee_thing_test'
 * (vezi config/db.js). Ruleaza intai schema pe ea:
 *   NODE_ENV=test npm run init-db
 * ---------------------------------------------------------------------
 */
const pool = require('../src/config/db');

/**
 * Goleste tabelele si reinsereaza mesele de baza.
 * Ordinea de stergere respecta cheile straine (copiii inaintea parintilor).
 */
async function resetDatabase() {
  // dezactivam temporar verificarea cheilor straine pentru golire rapida
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  await pool.query('TRUNCATE TABLE order_items');
  await pool.query('TRUNCATE TABLE orders');
  await pool.query('TRUNCATE TABLE customers');
  await pool.query('TRUNCATE TABLE products');
  await pool.query('TRUNCATE TABLE tables_seating');
  await pool.query('TRUNCATE TABLE users');
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');

  // reinseram cateva mese pentru testele de comenzi
  await pool.query(`
    INSERT INTO tables_seating (id, number, capacity, status) VALUES
      (1, 1, 2, 'free'),
      (2, 2, 4, 'free'),
      (3, 3, 6, 'free')
  `);
}

/**
 * Insereaza un client direct in baza de date (pentru testele de comenzi).
 * @param {number} tableId
 * @returns {Promise<number>} id-ul clientului creat
 */
async function createTestCustomer(tableId = 1) {
  const [result] = await pool.query(
    'INSERT INTO customers (name, table_id) VALUES (?, ?)',
    ['Client Test', tableId]
  );
  return result.insertId;
}

/** Inchide pool-ul de conexiuni (apelat dupa toate testele). */
async function closeDatabase() {
  await pool.end();
}

module.exports = { resetDatabase, createTestCustomer, closeDatabase, pool };
