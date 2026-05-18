/**
 * productRoutes.js
 * Rutele CRUD pentru produse. Montate sub /api/products in server.js.
 *
 *   GET    /api/products       -> listare (public)
 *   GET    /api/products/:id   -> un produs (public)
 *   POST   /api/products       -> creare (protejat: necesita JWT)
 *   PUT    /api/products/:id   -> actualizare (protejat + autorizare proprietar)
 *   DELETE /api/products/:id   -> stergere (protejat + autorizare proprietar)
 */
const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');

// rute publice (citire)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// rute protejate (scriere) - necesita token JWT valid
router.post('/', authenticate, createProduct);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);

module.exports = router;
