/**
 * init-db.js
 * ---------------------------------------------------------------------
 * Script pentru initializarea bazei de date.
 *
 *   1. creeaza baza de date tinta (productie SAU test)
 *   2. ruleaza schema.sql (creeaza tabelele + insereaza mesele)
 *   3. creeaza un utilizator admin implicit (parola hash-uita cu bcrypt)
 *   4. populeaza tabela products cu produsele din meniul cafenelei
 *
 * Rulare:
 *   npm run init-db        -> baza de date de productie (coffee_thing)
 *   npm run init-db:test   -> baza de date de test     (coffee_thing_test)
 *
 * Scriptul este idempotent: poate fi rulat de mai multe ori fara erori
 * (schema.sql sterge si recreeaza tabelele de fiecare data).
 * ---------------------------------------------------------------------
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// .trim() elimina spatiile accidentale (ex: NODE_ENV="test " pe Windows)
const isTest = (process.env.NODE_ENV || '').trim() === 'test';
const DB_NAME = isTest
  ? (process.env.DB_NAME_TEST || 'coffee_thing_test')
  : (process.env.DB_NAME || 'coffee_thing');

// Produsele din meniu (corespund datelor din aplicatia frontend)
const SEED_PRODUCTS = [
  ['House Blend Coffee', 'Amestec echilibrat cu note de ciocolata si caramel', 3.50, 'coffee'],
  ['Colombian Dark Roast', 'Prajire intensa din muntii Columbiei', 4.00, 'coffee'],
  ['Ethiopian Single Origin', 'Note fructate si florale, complexitate ca de vin', 4.50, 'coffee'],
  ['Classic Espresso', 'Shot concentrat din cel mai bun amestec espresso', 2.50, 'espresso'],
  ['Cappuccino', 'Espresso cu spuma de lapte aburit', 4.50, 'espresso'],
  ['Caramel Latte', 'Espresso cu lapte aburit si sirop de caramel', 5.00, 'espresso'],
  ['Mocha', 'Espresso cu ciocolata si lapte, frisca deasupra', 5.50, 'espresso'],
  ['Earl Grey', 'Ceai negru clasic cu aroma de bergamota', 3.00, 'tea'],
  ['Green Matcha', 'Matcha japonez premium', 4.50, 'tea'],
  ['Chamomile Honey', 'Ceai de musetel cu miere locala', 3.50, 'tea'],
  ['Tiramisu', 'Desert italian clasic cu mascarpone', 6.50, 'desserts'],
  ['Chocolate Cake', 'Tort de ciocolata bogat, in trei straturi', 5.50, 'desserts'],
  ['Cheesecake', 'Cheesecake in stil New York cu compot de fructe', 6.00, 'desserts'],
  ['Croissant', 'Foietaj frantuzesc copt zilnic', 3.50, 'desserts'],
  ['Iced Americano', 'Espresso peste gheata cu apa rece', 4.00, 'cold-drinks'],
  ['Cold Brew', 'Cafea infuzata la rece timp de 18 ore', 4.50, 'cold-drinks'],
  ['Iced Mocha Frappe', 'Cafea cu gheata, ciocolata si frisca', 5.50, 'cold-drinks'],
  ['Fresh Lemonade', 'Limonada de casa cu lamai proaspete si menta', 3.50, 'cold-drinks'],
  ['Avocado Toast', 'Paine cu avocado, rosii cherry si ou posat', 9.00, 'breakfast'],
  ['Belgian Waffle', 'Vafa crocanta cu sirop de artar si fructe', 8.50, 'breakfast'],
  ['Eggs Benedict', 'Oua posate pe muffin cu sos hollandaise', 12.00, 'breakfast'],
  ['Granola Bowl', 'Granola de casa cu iaurt grecesc si fructe', 7.50, 'breakfast'],
];

async function initDatabase() {
  // conexiune initiala FARA baza de date selectata (o cream chiar acum)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true, // necesar pentru a rula tot fisierul schema.sql
  });

  try {
    console.log(`> Initializare baza de date: ${DB_NAME}`);

    // --- 1. creeaza si selecteaza baza de date tinta ---
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.query(`USE \`${DB_NAME}\``);

    // --- 2. ruleaza schema.sql (creare tabele + seed mese) ---
    // schema.sql contine doar definitiile tabelelor, fara CREATE DATABASE
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);
    console.log('  [OK] Schema aplicata (tabele create + mese inserate)');

    // --- 3. creeaza utilizatorul admin implicit ---
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const [adminResult] = await connection.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      ['Admin User', 'admin@brewmaster.com', adminPasswordHash, 'admin']
    );
    const adminId = adminResult.insertId;
    console.log('  [OK] Utilizator admin creat (admin@brewmaster.com / admin123)');

    // --- 4. populeaza produsele (proprietar = admin) ---
    for (const [name, description, price, category] of SEED_PRODUCTS) {
      await connection.query(
        `INSERT INTO products (name, description, price, category, owner_id)
         VALUES (?, ?, ?, ?, ?)`,
        [name, description, price, category, adminId]
      );
    }
    console.log(`  [OK] ${SEED_PRODUCTS.length} produse inserate`);

    console.log('> Initializare finalizata cu succes.');
  } catch (err) {
    console.error('> EROARE la initializare:', err.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

initDatabase();
