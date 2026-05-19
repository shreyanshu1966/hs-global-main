const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { getAdminConfig, updateAdminConfig } = require('../controllers/popupConfigController');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/popup-config', getAdminConfig);
router.put('/popup-config', updateAdminConfig);

module.exports = router;
