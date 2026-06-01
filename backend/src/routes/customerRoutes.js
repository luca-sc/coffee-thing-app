const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer, deleteCustomer } = require('../controllers/customerController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', getCustomers);
// allow public creation of customers (no auth required for patrons)
router.post('/', createCustomer);
router.delete('/:id', authenticate, deleteCustomer);

module.exports = router;
