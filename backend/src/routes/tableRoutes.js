const express = require('express');
const router = express.Router();
const { getAllTables, updateTableStatus } = require('../controllers/tableController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', getAllTables);
router.put('/:id/status', authenticate, updateTableStatus);

module.exports = router;
