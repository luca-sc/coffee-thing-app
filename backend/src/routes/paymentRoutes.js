const express = require('express');
const router = express.Router();
const { setPaymentMethod, payOrder } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');

router.put('/:id/payment-method', authenticate, setPaymentMethod);
router.put('/:id/pay', authenticate, payOrder);

module.exports = router;
