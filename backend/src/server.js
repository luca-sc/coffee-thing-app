/**
 * server.js
 * ---------------------------------------------------------------------
 * Punctul de intrare al aplicatiei. Porneste serverul HTTP.
 *
 * Backend-ul ruleaza pe portul 3000 (conform listei de verificare
 * integrare frontend-backend din cerinta).
 * ---------------------------------------------------------------------
 */
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('=======================================================');
  console.log(`  Server pornit pe http://localhost:${PORT}`);
  console.log('=======================================================');
  console.log('  Rute disponibile:');
  console.log('    POST   /api/auth/register');
  console.log('    POST   /api/auth/login');
  console.log('    GET    /api/auth/me            (protejat)');
  console.log('    GET    /api/products');
  console.log('    GET    /api/products/:id');
  console.log('    POST   /api/products           (protejat)');
  console.log('    PUT    /api/products/:id       (protejat)');
  console.log('    DELETE /api/products/:id       (protejat)');
  console.log('    GET    /api/orders             (protejat)');
  console.log('    POST   /api/orders             (protejat)');
  console.log('    PUT    /api/orders/:id/status  (protejat)');
  console.log('    GET    /api/health');
  console.log('=======================================================');
});
