const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const {
  getHomePageConfig,
  updateHomePageConfig,
} = require('../controllers/homePageConfigController');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/homepage', getHomePageConfig);
router.put('/homepage', updateHomePageConfig);

module.exports = router;
