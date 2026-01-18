# Email Service Robustness Improvements

## Overview
Implemented comprehensive improvements to the email service to resolve "421 Too many concurrent SMTP connections" errors and ensure reliable email delivery.

## Problems Identified

### 1. **Too Many Concurrent Connections**
- **Error**: `421 Too many concurrent SMTP connections from this IP address`
- **Root Cause**: Multiple simultaneous connections to GoDaddy SMTP server
- **Impact**: Email service initialization failures and retry loops

### 2. **Aggressive Connection Pooling**
- Previous settings: `maxConnections: 3`, `rateLimit: 5`
- GoDaddy SMTP has strict connection limits
- Retry logic was creating new connections instead of reusing existing ones

### 3. **No Connection Lifecycle Management**
- No proper connection cleanup on errors
- No graceful shutdown handling
- Concurrent initialization attempts

## Solutions Implemented

### 1. **Optimized Connection Pool Settings**

#### For GoDaddy SMTP:
```javascript
{
  maxConnections: 1,        // Only 1 connection to prevent "too many connections"
  maxMessages: 10,          // Reduced to prevent connection exhaustion
  rateDelta: 2000,          // 2 seconds between batches
  rateLimit: 2,             // Max 2 emails per rateDelta
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 30000
}
```

#### For Gmail (if used):
```javascript
{
  maxConnections: 2,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 3
}
```

### 2. **Single Persistent Connection**
- **Global transporter instance**: Reused across all email sends
- **Lazy initialization**: Connection created only when needed
- **Connection verification**: Checks health before use
- **Automatic reconnection**: Handles broken connections gracefully

### 3. **Concurrent Initialization Prevention**
```javascript
let isInitializing = false;
let lastConnectionAttempt = 0;
const CONNECTION_RETRY_DELAY = 5000;
```

- Prevents multiple simultaneous initialization attempts
- Rate limits connection attempts (5 seconds minimum between attempts)
- Queues requests during initialization

### 4. **Exponential Backoff Retry Logic**

#### Connection Initialization:
- Max 3 retry attempts for 421 errors
- Backoff: 5s, 10s, 20s (capped at 30s)

#### Email Sending:
- Max 3 retry attempts
- Backoff: 2s, 4s, 8s (capped at 10s)
- Different handling for connection vs. other errors

### 5. **Proper Connection Cleanup**

#### On Errors:
```javascript
if (transporter && transporter.close) {
  transporter.close();
}
transporter = null;
```

#### On Server Shutdown:
```javascript
// Graceful shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

### 6. **Enhanced Error Handling**
- Detects specific error codes: `ESOCKET`, `ECONNECTION`, `EAUTH`, `EPROTOCOL`, `421`
- Closes broken connections before retry
- Provides detailed logging for debugging

### 7. **Connection Verification with Timeout**
```javascript
const verifyPromise = newTransporter.verify();
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Connection verification timeout')), 15000)
);
await Promise.race([verifyPromise, timeoutPromise]);
```

## Key Features

### ✅ **Reliability**
- Single persistent connection reduces overhead
- Automatic reconnection on failures
- Exponential backoff prevents server overload

### ✅ **Performance**
- Connection pooling for efficient email delivery
- Rate limiting prevents throttling
- Lazy initialization reduces startup time

### ✅ **Robustness**
- Handles concurrent requests gracefully
- Prevents connection leaks
- Graceful shutdown on server termination

### ✅ **Monitoring**
- Detailed console logging for debugging
- Connection state tracking
- Retry attempt tracking

## Configuration

### Environment Variables (.env)
```env
# SMTP Email Configuration (GoDaddy)
SMTP_HOST=sg2plzcpnl509436.prod.sin2.secureserver.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contact@hsglobalexport.com
SMTP_PASS=Hsglobal@2026contact

# Email addresses
EMAIL_FROM=contact@hsglobalexport.com
EMAIL_TO=inquiry@hsglobalexport.com
```

## Usage

### Server Startup
```javascript
const { initEmailService } = require('./services/emailService');
await initEmailService();
```

### Sending Emails
```javascript
const { sendVerificationEmail } = require('./services/emailService');
const result = await sendVerificationEmail(email, name, token);

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Email failed:', result.error);
}
```

### Server Shutdown
```javascript
const { closeEmailService } = require('./services/emailService');
await closeEmailService();
```

## Testing Recommendations

### 1. **Connection Stability**
- Monitor logs for connection errors
- Check for "too many connections" errors
- Verify automatic reconnection works

### 2. **Email Delivery**
- Test verification emails
- Test contact form emails
- Test quotation emails
- Test order confirmation emails

### 3. **Load Testing**
- Send multiple emails concurrently
- Verify rate limiting works
- Check connection pool behavior

### 4. **Error Recovery**
- Simulate network failures
- Test retry logic
- Verify graceful degradation

## Monitoring

### Success Indicators
```
✅ Email service connected successfully
✅ Verification email sent: <message-id>
✅ Contact notification email sent to admin: <message-id>
```

### Warning Indicators
```
⚠️ Transporter not found, initializing...
⚠️ Existing connection broken, reconnecting...
⏳ Waiting before next connection attempt...
```

### Error Indicators
```
❌ Email service initialization failed: <error>
❌ Send attempt failed. Retries left: <count>
🔄 Detected connection/auth issue. Re-initializing...
```

## Files Modified

1. **backend/services/emailService.js**
   - Enhanced connection management
   - Added exponential backoff
   - Improved error handling
   - Added cleanup function

2. **backend/server.js**
   - Added graceful shutdown handlers
   - Integrated email service cleanup
   - Added database connection cleanup

## Next Steps

1. **Monitor Production Logs**: Watch for any connection errors
2. **Adjust Rate Limits**: Fine-tune based on actual usage patterns
3. **Add Metrics**: Consider adding email delivery metrics
4. **Queue System**: For high-volume scenarios, consider a message queue (e.g., Bull, RabbitMQ)

## Troubleshooting

### Issue: Still getting "too many connections"
**Solution**: Reduce `maxConnections` to 1 and increase `rateDelta`

### Issue: Emails sending slowly
**Solution**: Increase `rateLimit` carefully (test incrementally)

### Issue: Connection timeouts
**Solution**: Increase `connectionTimeout` and `socketTimeout`

### Issue: Initialization loops
**Solution**: Check `CONNECTION_RETRY_DELAY` and backoff settings

## Performance Metrics

### Before Improvements:
- ❌ Multiple concurrent connections
- ❌ Frequent 421 errors
- ❌ Retry loops causing service degradation

### After Improvements:
- ✅ Single persistent connection
- ✅ Zero 421 errors (expected)
- ✅ Reliable email delivery with automatic recovery

---

**Last Updated**: 2026-01-19
**Version**: 2.0.0
**Status**: Production Ready
