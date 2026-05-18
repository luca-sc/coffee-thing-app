/**
 * Configurarea conexiunii la baza de date MySQL.
 *
 * Foloseste un pool de conexiuni (mai eficient decat o singura conexiune)
 * si comuta automat pe baza de date de TEST cand NODE_ENV === 'test',
 * astfel incat testele sa nu modifice datele de productie.
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

// .trim() elimina spatiile accidentale (ex: NODE_ENV="test " pe Windows)
const isTest = (process.env.NODE_ENV || '').trim() === 'test';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  // baza de date difera intre rulare normala si rularea testelor
  database: isTest
    ? (process.env.DB_NAME_TEST || 'coffee_thing_test')
    : (process.env.DB_NAME || 'coffee_thing'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // necesar ca DECIMAL sa fie returnat ca numar, nu ca string
  decimalNumbers: true,
});

module.exports = pool;
