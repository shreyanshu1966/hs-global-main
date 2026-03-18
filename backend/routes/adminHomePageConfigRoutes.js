const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const {
  getHomePageConfig,
  updateHomePageConfig,
  uploadHomePageImage,
} = require('../controllers/homePageConfigController');
const { upload } = require('../utils/cloudinaryUpload');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/homepage', getHomePageConfig);
router.put('/homepage', updateHomePageConfig);
router.post('/homepage/upload-image', upload.single('image'), uploadHomePageImage);

module.exports = router;
