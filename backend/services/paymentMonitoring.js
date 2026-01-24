/**
 * Payment Monitoring Service
 * Tracks payment system health and provides insights
 */

const Order = require('../models/Order');

class PaymentMonitor {
    constructor() {
        this.metrics = {
            totalOrders: 0,
            successfulPayments: 0,
            failedPayments: 0,
            averageProcessingTime: 0,
            riskDistribution: { LOW: 0, MEDIUM: 0, HIGH: 0 },
            lastUpdated: null
        };
        
        // Update metrics every 5 minutes
        setInterval(() => {
            this.updateMetrics();
        }, 5 * 60 * 1000);
        
        // Initial metrics update
        this.updateMetrics();
    }

    /**
     * Update payment metrics
     */
    async updateMetrics() {
        try {
            const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            // Get orders from last 24 hours
            const orders = await Order.find({
                createdAt: { $gte: last24Hours }
            }).select('status paymentDetails riskLevel createdAt updatedAt');

            this.metrics.totalOrders = orders.length;
            this.metrics.successfulPayments = orders.filter(o => o.status === 'paid').length;
            this.metrics.failedPayments = orders.filter(o => 
                ['failed', 'capture_failed', 'cancelled'].includes(o.status)
            ).length;

            // Calculate success rate
            this.metrics.successRate = this.metrics.totalOrders > 0 
                ? (this.metrics.successfulPayments / this.metrics.totalOrders * 100).toFixed(2)
                : 0;

            // Risk distribution
            this.metrics.riskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0 };
            orders.forEach(order => {
                if (order.riskLevel) {
                    this.metrics.riskDistribution[order.riskLevel]++;
                }
            });

            // Average processing time for successful payments
            const successfulOrders = orders.filter(o => 
                o.status === 'paid' && o.paymentDetails?.processingTime
            );
            
            if (successfulOrders.length > 0) {
                const totalTime = successfulOrders.reduce((sum, order) => 
                    sum + (order.paymentDetails.processingTime || 0), 0
                );
                this.metrics.averageProcessingTime = Math.round(totalTime / successfulOrders.length);
            }

            this.metrics.lastUpdated = new Date();
            console.log(`📊 Payment metrics updated: Success rate: ${this.metrics.successRate}%`);
            
        } catch (error) {
            console.error('Failed to update payment metrics:', error);
        }
    }

    /**
     * Get current payment system health
     */
    getSystemHealth() {
        const successRate = parseFloat(this.metrics.successRate);
        let health = 'HEALTHY';
        let status = 'All systems operational';

        if (successRate < 95) {
            health = 'DEGRADED';
            status = 'Payment success rate below optimal';
        }
        
        if (successRate < 85) {
            health = 'CRITICAL';
            status = 'Critical payment system issues detected';
        }

        if (this.metrics.averageProcessingTime > 15000) { // 15 seconds
            health = 'DEGRADED';
            status = 'Payment processing times elevated';
        }

        return {
            health,
            status,
            metrics: this.metrics,
            recommendations: this.getRecommendations()
        };
    }

    /**
     * Get recommendations based on current metrics
     */
    getRecommendations() {
        const recommendations = [];
        const successRate = parseFloat(this.metrics.successRate);
        
        if (successRate < 90) {
            recommendations.push('Investigate payment failures and error patterns');
        }
        
        if (this.metrics.riskDistribution.HIGH > this.metrics.riskDistribution.LOW) {
            recommendations.push('Review risk assessment parameters');
        }
        
        if (this.metrics.averageProcessingTime > 10000) {
            recommendations.push('Optimize payment processing performance');
        }

        if (recommendations.length === 0) {
            recommendations.push('Payment system is operating optimally');
        }

        return recommendations;
    }

    /**
     * Get detailed analytics for admin dashboard
     */
    async getDetailedAnalytics(days = 7) {
        try {
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            
            const pipeline = [
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                            status: "$status"
                        },
                        count: { $sum: 1 },
                        totalAmount: { $sum: "$amount" }
                    }
                },
                { $sort: { "_id.date": 1 } }
            ];

            const dailyStats = await Order.aggregate(pipeline);
            
            // Risk analysis
            const riskAnalysis = await Order.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: "$riskLevel",
                        count: { $sum: 1 },
                        successRate: {
                            $avg: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] }
                        }
                    }
                }
            ]);

            return {
                dailyStats,
                riskAnalysis,
                period: `${days} days`,
                generatedAt: new Date()
            };

        } catch (error) {
            console.error('Failed to generate detailed analytics:', error);
            throw error;
        }
    }

    /**
     * Alert on critical issues
     */
    async checkForAlerts() {
        const health = this.getSystemHealth();
        
        if (health.health === 'CRITICAL') {
            console.error('🚨 CRITICAL PAYMENT SYSTEM ALERT:', health.status);
            // Here you could integrate with alerting systems like email, Slack, etc.
            return {
                level: 'CRITICAL',
                message: health.status,
                timestamp: new Date()
            };
        } else if (health.health === 'DEGRADED') {
            console.warn('⚠️ Payment system degraded:', health.status);
            return {
                level: 'WARNING',
                message: health.status,
                timestamp: new Date()
            };
        }

        return null;
    }

    /**
     * Get payment trends
     */
    async getPaymentTrends() {
        try {
            const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            
            const trends = await Order.aggregate([
                { $match: { createdAt: { $gte: last30Days } } },
                {
                    $group: {
                        _id: {
                            week: { $week: "$createdAt" },
                            year: { $year: "$createdAt" }
                        },
                        totalOrders: { $sum: 1 },
                        successfulOrders: {
                            $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] }
                        },
                        totalRevenue: {
                            $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0] }
                        },
                        averageOrderValue: { $avg: "$amount" }
                    }
                },
                { $sort: { "_id.year": 1, "_id.week": 1 } }
            ]);

            return trends;

        } catch (error) {
            console.error('Failed to get payment trends:', error);
            throw error;
        }
    }
}

// Create singleton instance
const paymentMonitor = new PaymentMonitor();

module.exports = {
    paymentMonitor,
    PaymentMonitor
};