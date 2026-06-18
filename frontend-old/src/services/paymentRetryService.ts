/**
 * Payment Retry Service
 * Handles payment retry logic with exponential backoff
 * Stores failed payment attempts and provides retry functionality
 */

interface PaymentAttempt {
    orderId: string;
    attemptNumber: number;
    timestamp: number;
    error?: string;
}

interface RetryConfig {
    maxRetries: number;
    baseDelay: number; // milliseconds
    maxDelay: number; // milliseconds
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
};

class PaymentRetryService {
    private attempts: Map<string, PaymentAttempt[]>;
    private config: RetryConfig;

    constructor(config: Partial<RetryConfig> = {}) {
        this.attempts = new Map();
        this.config = { ...DEFAULT_RETRY_CONFIG, ...config };

        // Load attempts from localStorage
        this.loadAttempts();
    }

    /**
     * Load payment attempts from localStorage
     */
    private loadAttempts(): void {
        try {
            const stored = localStorage.getItem('paymentAttempts');
            if (stored) {
                const data = JSON.parse(stored);
                this.attempts = new Map(Object.entries(data));
            }
        } catch (error) {
            console.error('Failed to load payment attempts:', error);
        }
    }

    /**
     * Save payment attempts to localStorage
     */
    private saveAttempts(): void {
        try {
            const data = Object.fromEntries(this.attempts);
            localStorage.setItem('paymentAttempts', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save payment attempts:', error);
        }
    }

    /**
     * Record a payment attempt
     */
    recordAttempt(orderId: string, error?: string): void {
        const attempts = this.attempts.get(orderId) || [];

        attempts.push({
            orderId,
            attemptNumber: attempts.length + 1,
            timestamp: Date.now(),
            error,
        });

        this.attempts.set(orderId, attempts);
        this.saveAttempts();
    }

    /**
     * Get all attempts for an order
     */
    getAttempts(orderId: string): PaymentAttempt[] {
        return this.attempts.get(orderId) || [];
    }

    /**
     * Check if retry is allowed for an order
     */
    canRetry(orderId: string): boolean {
        const attempts = this.getAttempts(orderId);
        return attempts.length < this.config.maxRetries;
    }

    /**
     * Get the number of remaining retries
     */
    getRemainingRetries(orderId: string): number {
        const attempts = this.getAttempts(orderId);
        return Math.max(0, this.config.maxRetries - attempts.length);
    }

    /**
     * Calculate delay before next retry using exponential backoff
     */
    getRetryDelay(orderId: string): number {
        const attempts = this.getAttempts(orderId);
        const attemptNumber = attempts.length;

        // Exponential backoff: delay = baseDelay * 2^attemptNumber
        const delay = this.config.baseDelay * Math.pow(2, attemptNumber);

        // Cap at maxDelay
        return Math.min(delay, this.config.maxDelay);
    }

    /**
     * Check if enough time has passed since last attempt
     */
    canRetryNow(orderId: string): boolean {
        const attempts = this.getAttempts(orderId);

        if (attempts.length === 0) {
            return true;
        }

        const lastAttempt = attempts[attempts.length - 1];
        const timeSinceLastAttempt = Date.now() - lastAttempt.timestamp;
        const requiredDelay = this.getRetryDelay(orderId);

        return timeSinceLastAttempt >= requiredDelay;
    }

    /**
     * Get time remaining until next retry is allowed
     */
    getTimeUntilNextRetry(orderId: string): number {
        const attempts = this.getAttempts(orderId);

        if (attempts.length === 0) {
            return 0;
        }

        const lastAttempt = attempts[attempts.length - 1];
        const timeSinceLastAttempt = Date.now() - lastAttempt.timestamp;
        const requiredDelay = this.getRetryDelay(orderId);

        return Math.max(0, requiredDelay - timeSinceLastAttempt);
    }

    /**
     * Clear attempts for an order (call on successful payment)
     */
    clearAttempts(orderId: string): void {
        this.attempts.delete(orderId);
        this.saveAttempts();
    }

    /**
     * Clear all attempts (cleanup)
     */
    clearAllAttempts(): void {
        this.attempts.clear();
        this.saveAttempts();
    }

    /**
     * Clean up old attempts (older than 24 hours)
     */
    cleanupOldAttempts(): void {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

        for (const [orderId, attempts] of this.attempts.entries()) {
            const recentAttempts = attempts.filter(
                attempt => attempt.timestamp > oneDayAgo
            );

            if (recentAttempts.length === 0) {
                this.attempts.delete(orderId);
            } else {
                this.attempts.set(orderId, recentAttempts);
            }
        }

        this.saveAttempts();
    }

    /**
     * Get retry information for display
     */
    getRetryInfo(orderId: string): {
        canRetry: boolean;
        remainingRetries: number;
        canRetryNow: boolean;
        timeUntilNextRetry: number;
        attemptCount: number;
    } {
        return {
            canRetry: this.canRetry(orderId),
            remainingRetries: this.getRemainingRetries(orderId),
            canRetryNow: this.canRetryNow(orderId),
            timeUntilNextRetry: this.getTimeUntilNextRetry(orderId),
            attemptCount: this.getAttempts(orderId).length,
        };
    }
}

// Create singleton instance
const paymentRetryService = new PaymentRetryService();

// Cleanup old attempts on initialization
paymentRetryService.cleanupOldAttempts();

export default paymentRetryService;
