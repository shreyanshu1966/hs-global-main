const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['user', 'admin'],
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    readByAdmin: {
        type: Boolean,
        default: false
    },
    readByUser: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const chatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    messages: [messageSchema],
    status: {
        type: String,
        enum: ['open', 'replied', 'closed'],
        default: 'open'
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    adminNotified: {
        type: Boolean,
        default: false
    },
    unreadByAdmin: {
        type: Number,
        default: 0
    },
    unreadByUser: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient queries
chatSchema.index({ user: 1, status: 1 });
chatSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
