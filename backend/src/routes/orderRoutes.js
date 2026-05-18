/**
 * orderRoutes.js
 * Rutele pentru comenzi. Montate sub /api/orders in server.js.
 * Toate rutele necesita autentificare.
 *
 *   GET  /api/orders            -> listare comenzi
 *   GET  /api/orders/:id        -> o comanda cu liniile ei
 *   POST /api/orders            -> creare comanda (calcul total)
 *   PUT  /api/orders/:id/status -> schimbare stare comanda
 */
const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');

// toate rutele de comenzi sunt protejate
router.use(authenticate);

router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id/status', updateOrderStatus);

module.exports = router;
