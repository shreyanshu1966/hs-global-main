const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');

// GET /api/currency/rates - Get exchange rates (with 24h cache)
router.get('/rates', currencyController.getRates);

module.exports = router;
