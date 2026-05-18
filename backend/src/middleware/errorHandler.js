/**
 * errorHandler.js
 * ---------------------------------------------------------------------
 * Middleware global de tratare a erorilor.
 *
 *  - notFound:     prinde rutele inexistente -> 404
 *  - errorHandler: prinde orice eroare aruncata in rute -> raspuns JSON
 *
 * Trebuie inregistrate ULTIMELE in lantul de middleware din server.js.
 * ---------------------------------------------------------------------
 */

/** Ruta inexistenta -> 404 */
function notFound(req, res, _next) {
  res.status(404).json({
    success: false,
    error: `Ruta ${req.method} ${req.originalUrl} nu a fost gasita.`,
  });
}

/** Tratarea centralizata a erorilor */
function errorHandler(err, _req, res, _next) {
  // log pe server pentru depanare
  console.error('[EROARE]', err.message);

  // codul de status: cel setat explicit pe eroare, altfel 500
  const status = err.statusCode || 500;

  res.status(status).json({
    success: false,
    error: err.message || 'Eroare interna de server.',
  });
}

module.exports = { notFound, errorHandler };
