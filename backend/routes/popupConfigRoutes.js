const express = require('express');
const router = express.Router();
const { getPublicConfig } = require('../controllers/popupConfigController');

router.get('/popup-config', getPublicConfig);

module.exports = router;
