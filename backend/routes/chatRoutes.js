const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// ─── User routes (requires login) ────────────────────────────────────────────
router.post('/message', authMiddleware, chatController.sendMessage);
router.get('/my-chat', authMiddleware, chatController.getUserChat);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get('/admin/all', authMiddleware, adminMiddleware, chatController.getAllChats);
router.get('/admin/unread', authMiddleware, adminMiddleware, chatController.getUnreadCount);
router.get('/admin/:id', authMiddleware, adminMiddleware, chatController.getChatById);
router.post('/admin/:id/reply', authMiddleware, adminMiddleware, chatController.adminReply);
router.patch('/admin/:id/close', authMiddleware, adminMiddleware, chatController.closeChat);

module.exports = router;
