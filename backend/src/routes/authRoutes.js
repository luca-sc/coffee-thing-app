/**
 * authRoutes.js
 * Rutele de autentificare. Montate sub /api/auth in server.js.
 *
 *   POST /api/auth/register  -> inregistrare (public)
 *   POST /api/auth/login     -> autentificare (public)
 *   GET  /api/auth/me        -> date utilizator curent (protejat)
 */
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);

module.exports = router;
