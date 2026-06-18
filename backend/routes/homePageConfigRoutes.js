const express = require('express');
const router = express.Router();
const { getHomePageConfig } = require('../controllers/homePageConfigController');

const publicCache = (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=60');
    next();
};

router.get('/homepage', publicCache, getHomePageConfig);

module.exports = router;
