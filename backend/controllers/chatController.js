const Chat = require('../models/Chat');
const { sendChatNotificationEmail, sendAdminReplyNotificationEmail } = require('../services/emailService');

// ─── User: Send a message (creates or continues a chat session) ───────────────
exports.sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user._id;
        const userName = req.user.name;
        const userEmail = req.user.email;

        if (!text || !text.trim()) {
            return res.status(400).json({ ok: false, error: 'Message text is required' });
        }

        // Find existing open/replied chat or create a new one
        let chat = await Chat.findOne({ user: userId, status: { $in: ['open', 'replied'] } });

        const newMessage = {
            sender: 'user',
            text: text.trim(),
            readByAdmin: false,
            readByUser: true
        };

        if (chat) {
            chat.messages.push(newMessage);
            chat.status = 'open';
            chat.lastMessageAt = new Date();
            chat.unreadByAdmin += 1;
            await chat.save();
        } else {
            chat = await Chat.create({
                user: userId,
                userName,
                userEmail,
                messages: [newMessage],
                status: 'open',
                lastMessageAt: new Date(),
                unreadByAdmin: 1
            });
        }

        // Send email notification to admin (only for first message of a session or after some gap)
        try {
            await sendChatNotificationEmail({
                userName,
                userEmail,
                message: text.trim(),
                chatId: chat._id.toString(),
                isFirstMessage: chat.messages.filter(m => m.sender === 'user').length === 1
            });
        } catch (emailErr) {
            console.error('⚠️ Chat email notification failed (non-fatal):', emailErr.message);
        }

        res.json({ ok: true, chat: { _id: chat._id, messages: chat.messages, status: chat.status } });
    } catch (error) {
        console.error('❌ sendMessage error:', error);
        res.status(500).json({ ok: false, error: 'Failed to send message' });
    }
};

// ─── User: Get their chat session ────────────────────────────────────────────
exports.getUserChat = async (req, res) => {
    try {
        const userId = req.user._id;

        const chat = await Chat.findOne({ user: userId, status: { $in: ['open', 'replied'] } })
            .sort({ lastMessageAt: -1 });

        if (!chat) {
            return res.json({ ok: true, chat: null });
        }

        // Mark admin messages as read by user
        let updated = false;
        chat.messages.forEach(msg => {
            if (msg.sender === 'admin' && !msg.readByUser) {
                msg.readByUser = true;
                updated = true;
            }
        });
        if (updated) {
            chat.unreadByUser = 0;
            await chat.save();
        }

        res.json({ ok: true, chat });
    } catch (error) {
        console.error('❌ getUserChat error:', error);
        res.status(500).json({ ok: false, error: 'Failed to get chat' });
    }
};

// ─── Admin: Get all chats ─────────────────────────────────────────────────────
exports.getAllChats = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;

        const chats = await Chat.find(query)
            .sort({ lastMessageAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('user', 'name email avatar');

        const total = await Chat.countDocuments(query);
        const totalUnread = await Chat.aggregate([
            { $match: { status: { $in: ['open', 'replied'] } } },
            { $group: { _id: null, total: { $sum: '$unreadByAdmin' } } }
        ]);

        res.json({
            ok: true,
            chats,
            total,
            totalUnread: totalUnread[0]?.total || 0,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('❌ getAllChats error:', error);
        res.status(500).json({ ok: false, error: 'Failed to get chats' });
    }
};

// ─── Admin: Get single chat ───────────────────────────────────────────────────
exports.getChatById = async (req, res) => {
    try {
        const { id } = req.params;
        const chat = await Chat.findById(id).populate('user', 'name email avatar phone');

        if (!chat) {
            return res.status(404).json({ ok: false, error: 'Chat not found' });
        }

        // Mark user messages as read by admin
        let updated = false;
        chat.messages.forEach(msg => {
            if (msg.sender === 'user' && !msg.readByAdmin) {
                msg.readByAdmin = true;
                updated = true;
            }
        });
        if (updated) {
            chat.unreadByAdmin = 0;
            await chat.save();
        }

        res.json({ ok: true, chat });
    } catch (error) {
        console.error('❌ getChatById error:', error);
        res.status(500).json({ ok: false, error: 'Failed to get chat' });
    }
};

// ─── Admin: Reply to a chat ───────────────────────────────────────────────────
exports.adminReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ ok: false, error: 'Reply text is required' });
        }

        const chat = await Chat.findById(id).populate('user', 'name email');

        if (!chat) {
            return res.status(404).json({ ok: false, error: 'Chat not found' });
        }

        chat.messages.push({
            sender: 'admin',
            text: text.trim(),
            readByAdmin: true,
            readByUser: false
        });
        chat.status = 'replied';
        chat.lastMessageAt = new Date();
        chat.unreadByUser += 1;
        await chat.save();

        // Notify user via email
        try {
            await sendAdminReplyNotificationEmail({
                userEmail: chat.userEmail,
                userName: chat.userName,
                adminReply: text.trim(),
                chatId: chat._id.toString()
            });
        } catch (emailErr) {
            console.error('⚠️ Admin reply email notification failed (non-fatal):', emailErr.message);
        }

        res.json({ ok: true, chat });
    } catch (error) {
        console.error('❌ adminReply error:', error);
        res.status(500).json({ ok: false, error: 'Failed to reply' });
    }
};

// ─── Admin: Close a chat ──────────────────────────────────────────────────────
exports.closeChat = async (req, res) => {
    try {
        const { id } = req.params;
        const chat = await Chat.findByIdAndUpdate(id, { status: 'closed' }, { new: true });

        if (!chat) {
            return res.status(404).json({ ok: false, error: 'Chat not found' });
        }

        res.json({ ok: true, chat });
    } catch (error) {
        console.error('❌ closeChat error:', error);
        res.status(500).json({ ok: false, error: 'Failed to close chat' });
    }
};

// ─── Admin: Get unread count ──────────────────────────────────────────────────
exports.getUnreadCount = async (req, res) => {
    try {
        const result = await Chat.aggregate([
            { $match: { status: { $in: ['open', 'replied'] }, unreadByAdmin: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: '$unreadByAdmin' }, chatCount: { $sum: 1 } } }
        ]);

        res.json({
            ok: true,
            unreadMessages: result[0]?.total || 0,
            unreadChats: result[0]?.chatCount || 0
        });
    } catch (error) {
        console.error('❌ getUnreadCount error:', error);
        res.status(500).json({ ok: false, error: 'Failed to get count' });
    }
};
