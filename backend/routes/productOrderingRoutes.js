const express = require('express');
const router = express.Router();
const { getOrdering, saveOrdering, resetOrdering } = require('../controllers/productOrderingController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/',    getOrdering);
router.put('/',    saveOrdering);
router.delete('/', resetOrdering);

module.exports = router;
