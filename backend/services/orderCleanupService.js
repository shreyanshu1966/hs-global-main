const cron = require('node-cron');
const { cleanupExpiredOrders } = require('../controllers/paymentController');

/**
 * Order Cleanup Service
 * Automatically cleans up expired and failed orders
 */
class OrderCleanupService {
    constructor() {
        this.isRunning = false;
        this.schedule = '*/30 * * * *'; // Every 30 minutes
    }

    /**
     * Start the cleanup scheduler
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️ Order cleanup service is already running');
            return;
        }

        console.log('🧹 Starting order cleanup service...');
        
        // Schedule cleanup every 30 minutes
        this.cleanupJob = cron.schedule(this.schedule, async () => {
            try {
                console.log('🧹 Running scheduled order cleanup...');
                await cleanupExpiredOrders(); // Call without req, res
            } catch (error) {
                console.error('❌ Scheduled cleanup failed:', error);
            }
        });

        // Run initial cleanup
        this.runInitialCleanup();
        
        this.isRunning = true;
        console.log('✅ Order cleanup service started successfully');
    }

    /**
     * Stop the cleanup scheduler
     */
    stop() {
        if (!this.isRunning) {
            console.log('⚠️ Order cleanup service is not running');
            return;
        }

        if (this.cleanupJob) {
            this.cleanupJob.destroy();
        }

        this.isRunning = false;
        console.log('⏹️ Order cleanup service stopped');
    }

    /**
     * Run cleanup immediately
     */
    async runCleanup() {
        try {
            console.log('🧹 Running manual order cleanup...');
            await cleanupExpiredOrders();
            console.log('✅ Manual cleanup completed');
        } catch (error) {
            console.error('❌ Manual cleanup failed:', error);
            throw error;
        }
    }

    /**
     * Run initial cleanup on startup
     */
    async runInitialCleanup() {
        try {
            // Wait a bit after server startup
            setTimeout(async () => {
                console.log('🧹 Running initial order cleanup...');
                await cleanupExpiredOrders();
                console.log('✅ Initial cleanup completed');
            }, 10000); // 10 seconds delay
        } catch (error) {
            console.error('❌ Initial cleanup failed:', error);
        }
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            running: this.isRunning,
            schedule: this.schedule,
            nextRun: this.cleanupJob ? this.cleanupJob.nextDates() : null
        };
    }
}

module.exports = new OrderCleanupService();