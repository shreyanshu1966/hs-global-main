const express = require('express');
const router = express.Router();
const { getHomePageConfig } = require('../controllers/homePageConfigController');

router.get('/homepage', getHomePageConfig);

module.exports = router;
