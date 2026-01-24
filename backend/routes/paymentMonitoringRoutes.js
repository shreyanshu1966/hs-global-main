/**
 * Payment System Monitoring Routes
 * Admin endpoints for monitoring payment health and analytics
 */

const express = require('express');
const router = express.Router();
const { paymentMonitor } = require('../services/paymentMonitoring');
const { authMiddleware } = require('../middleware/authMiddleware');

// Middleware to check admin access
const adminOnly = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({
            ok: false,
            error: 'Admin access required'
        });
    }
    next();
};

/**
 * Get payment system health
 * GET /api/admin/payment-health
 */
router.get('/payment-health', authMiddleware, adminOnly, async (req, res) => {
    try {
        const health = paymentMonitor.getSystemHealth();
        
        res.json({
            ok: true,
            health
        });

    } catch (error) {
        console.error('Failed to get payment health:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to retrieve payment system health'
        });
    }
});

/**
 * Get detailed payment analytics
 * GET /api/admin/payment-analytics?days=7
 */
router.get('/payment-analytics', authMiddleware, adminOnly, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        
        if (days < 1 || days > 90) {
            return res.status(400).json({
                ok: false,
                error: 'Days parameter must be between 1 and 90'
            });
        }

        const analytics = await paymentMonitor.getDetailedAnalytics(days);
        
        res.json({
            ok: true,
            analytics
        });

    } catch (error) {
        console.error('Failed to get payment analytics:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to retrieve payment analytics'
        });
    }
});

/**
 * Get payment trends
 * GET /api/admin/payment-trends
 */
router.get('/payment-trends', authMiddleware, adminOnly, async (req, res) => {
    try {
        const trends = await paymentMonitor.getPaymentTrends();
        
        res.json({
            ok: true,
            trends
        });

    } catch (error) {
        console.error('Failed to get payment trends:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to retrieve payment trends'
        });
    }
});

/**
 * Check for payment system alerts
 * GET /api/admin/payment-alerts
 */
router.get('/payment-alerts', authMiddleware, adminOnly, async (req, res) => {
    try {
        const alert = await paymentMonitor.checkForAlerts();
        
        res.json({
            ok: true,
            alert: alert || null,
            hasAlert: !!alert
        });

    } catch (error) {
        console.error('Failed to check payment alerts:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to check payment alerts'
        });
    }
});

/**
 * Get payment system status (public endpoint for status page)
 * GET /api/admin/payment-status
 */
router.get('/payment-status', async (req, res) => {
    try {
        const health = paymentMonitor.getSystemHealth();
        
        // Return simplified status for public consumption
        res.json({
            ok: true,
            status: health.health,
            message: health.status,
            lastUpdated: health.metrics.lastUpdated
        });

    } catch (error) {
        console.error('Failed to get payment status:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to retrieve payment status'
        });
    }
});

module.exports = router;