/**
 * authController.js
 * ---------------------------------------------------------------------
 * Controller pentru AUTENTIFICARE (Task 1 - testare de INTEGRARE).
 *
 * Acopera cazurile cerute de cerinta:
 *   - succes               -> inregistrare / login reusit
 *   - email duplicat       -> doi utilizatori nu pot avea acelasi email
 *   - credentiale invalide -> parola gresita / email inexistent
 *   - campuri lipsa        -> validarea datelor de intrare
 *
 * Parolele sunt HASH-uite cu bcrypt inainte de stocare; tokenul este
 * un JWT semnat care expira dupa intervalul din .env.
 * ---------------------------------------------------------------------
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// expresie regulata simpla pentru validarea formatului email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Construieste un token JWT pentru un utilizator.
 * @param {{id:number, email:string, role:string}} user
 * @returns {string}
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * POST /api/auth/register
 * Inregistreaza un utilizator nou.
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body || {};

    // --- validare campuri lipsa ---
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Campurile name, email si password sunt obligatorii.',
      });
    }

    // --- validare format email ---
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Formatul adresei de email este invalid.',
      });
    }

    // --- validare lungime parola ---
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Parola trebuie sa aiba cel putin 6 caractere.',
      });
    }

    // --- verificare email duplicat ---
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Exista deja un cont cu aceasta adresa de email.',
      });
    }

    // --- hash-uirea parolei (niciodata stocata in clar) ---
    const passwordHash = await bcrypt.hash(password, 10);

    // rol implicit 'staff' daca nu e specificat unul valid
    const validRoles = ['admin', 'manager', 'staff'];
    const userRole = validRoles.includes(role) ? role : 'staff';

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, userRole]
    );

    const user = { id: result.insertId, name, email, role: userRole };
    const token = signToken(user);

    return res.status(201).json({
      success: true,
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Autentifica un utilizator existent.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    // --- validare campuri lipsa ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Campurile email si password sunt obligatorii.',
      });
    }

    // --- cautarea utilizatorului dupa email ---
    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      [email]
    );

    // mesaj generic intentionat: nu dezvaluim daca emailul exista sau nu
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Email sau parola incorecte.',
      });
    }

    const dbUser = rows[0];

    // --- compararea parolei cu hash-ul stocat ---
    const passwordMatch = await bcrypt.compare(password, dbUser.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Email sau parola incorecte.',
      });
    }

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
    };
    const token = signToken(user);

    return res.json({
      success: true,
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returneaza datele utilizatorului autentificat (pe baza tokenului).
 */
async function getMe(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Utilizatorul nu a fost gasit.',
      });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, signToken };
