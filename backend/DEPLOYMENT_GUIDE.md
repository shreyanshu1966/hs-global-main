# Quick Deployment Guide - Email Service Update

## Changes Made
✅ Reduced SMTP connections from 3 to 1 (prevents "too many connections" error)
✅ Implemented exponential backoff retry logic
✅ Added connection pooling and rate limiting
✅ Added graceful shutdown handlers
✅ Improved error handling and recovery

## Deployment Steps

### Option 1: Restart PM2 Process (Recommended)
```bash
# SSH to your server
ssh root@srv1279576

# Navigate to backend directory
cd /var/www/hs-global-main/backend

# Pull latest changes
git pull origin main

# Restart the PM2 process
pm2 restart hs-backend

# Monitor logs
pm2 logs hs-backend --lines 50
```

### Option 2: Full Restart
```bash
# SSH to your server
ssh root@srv1279576

# Navigate to backend directory
cd /var/www/hs-global-main/backend

# Pull latest changes
git pull origin main

# Stop the process
pm2 stop hs-backend

# Start fresh
pm2 start hs-backend

# Save PM2 configuration
pm2 save
```

## Verification

### 1. Check Server Startup
Look for these success messages:
```
✅ MongoDB Connected: localhost
✅ Email service connected successfully
Server running on port 3000
```

### 2. Test Email Functionality
- Try sending a contact form submission
- Try requesting a quotation
- Check that both client and admin receive emails

### 3. Monitor for Errors
```bash
# Watch logs in real-time
pm2 logs hs-backend

# Check for these indicators:
# ✅ Success: "Email sent: <message-id>"
# ⚠️ Warning: "Waiting before next connection attempt"
# ❌ Error: Should see automatic retry with backoff
```

## Expected Behavior

### Before Fix:
```
❌ Email service initialization failed: Invalid greeting. response=421
❌ Too many concurrent SMTP connections
🔄 Attempt failed. Retries left: 3
🔄 Attempt failed. Retries left: 2
🔄 Attempt failed. Retries left: 1
```

### After Fix:
```
✅ Email service connected successfully
✅ Verification email sent: <message-id>
✅ Contact notification email sent to admin: <message-id>
```

## Troubleshooting

### If you still see connection errors:
1. Wait 5 minutes for existing connections to close
2. Restart PM2: `pm2 restart hs-backend`
3. Check logs: `pm2 logs hs-backend --lines 100`

### If emails are slow:
- This is expected with rate limiting (2 emails per 2 seconds)
- This prevents server blocks
- Emails will queue and send automatically

### If initialization fails:
- Check .env file has correct SMTP credentials
- Verify SMTP server is accessible
- Check firewall rules allow port 587

## Rollback Plan

If issues occur:
```bash
# Revert to previous version
git log --oneline -5
git checkout <previous-commit-hash>
pm2 restart hs-backend
```

## Support

For issues, check:
1. PM2 logs: `pm2 logs hs-backend`
2. System logs: `journalctl -u pm2-root -n 100`
3. Email service documentation: `EMAIL_SERVICE_IMPROVEMENTS.md`

---
**Deployment Date**: 2026-01-19
**Critical**: This update MUST be deployed to fix email service
