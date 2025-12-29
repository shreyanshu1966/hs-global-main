const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header or cookie
        let token = req.headers.authorization?.split(' ')[1]; // Bearer token

        if (!token && req.cookies) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                ok: false,
                error: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                ok: false,
                error: 'Invalid token. User not found.'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                ok: false,
                error: 'Invalid token.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                ok: false,
                error: 'Token expired. Please login again.'
            });
        }

        return res.status(500).json({
            ok: false,
            error: 'Authentication failed.'
        });
    }
};

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            ok: false,
            error: 'Access denied. Admin privileges required.'
        });
    }
};

module.exports = { authMiddleware, adminMiddleware };
