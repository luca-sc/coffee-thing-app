/**
 * authMiddleware.js
 * ---------------------------------------------------------------------
 * Middleware de autentificare bazat pe JWT.
 *
 *  - authenticate: verifica tokenul JWT din antetul Authorization.
 *      Daca lipseste / e invalid / expirat -> raspunde cu 401.
 *      Daca e valid -> ataseaza datele utilizatorului la req.user.
 *
 *  - authorizeRole: restrictioneaza accesul la anumite roluri
 *      (ex: doar 'admin'). Daca rolul nu e permis -> 403.
 *
 * Tokenul este trimis de frontend prin interceptorul de cerere Axios,
 * in formatul:  Authorization: Bearer <token>
 * ---------------------------------------------------------------------
 */
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_de_dezvoltare';

/**
 * Verifica prezenta si validitatea tokenului JWT.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  // antetul trebuie sa existe si sa aiba forma "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de autentificare lipsa. Autentificare necesara.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // verifica semnatura si expirarea; arunca eroare daca e invalid
    const payload = jwt.verify(token, JWT_SECRET);
    // datele utilizatorului devin disponibile in restul rutei
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Token invalid sau expirat.',
    });
  }
}

/**
 * Genereaza un middleware care permite accesul doar anumitor roluri.
 * @param  {...string} roles  rolurile permise (ex: 'admin', 'manager')
 */
function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acces interzis. Nu aveti permisiunile necesare.',
      });
    }
    next();
  };
}

module.exports = { authenticate, authorizeRole, JWT_SECRET };
