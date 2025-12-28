# GoDaddy Deployment Guide

This application is now configured for GoDaddy hosting with a Node.js backend.

## Prerequisites

1. **GoDaddy VPS or Dedicated Server** with Node.js support
2. **SSH access** to your GoDaddy server
3. **Domain** configured to point to your server

## Deployment Steps

### 1. Prepare Your Local Environment

```bash
# Install dependencies
npm install

# Build the frontend
npm run build

# Test locally (optional)
npm run start
```

### 2. Upload to GoDaddy Server

Upload these files to your GoDaddy server:
- `server.cjs` (main server file)
- `package.json`
- `dist/` folder (built frontend)
- `ecosystem.config.js` (PM2 configuration)

### 3. Server Setup

SSH into your GoDaddy server and run:

```bash
# Navigate to your app directory
cd /path/to/your/app

# Install dependencies
npm install --production

# Install PM2 globally (process manager)
npm install -g pm2

# Create environment file
cp env.example .env
# Edit .env with your actual values
nano .env
```

### 4. Environment Variables

Create a `.env` file with your actual values:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Twilio Configuration (for OTP)
TWILIO_ACCOUNT_SID=your_actual_twilio_account_sid
TWILIO_AUTH_TOKEN=your_actual_twilio_auth_token
TWILIO_FROM=your_actual_twilio_phone_number

# SMTP Configuration (for email sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_actual_email@gmail.com
SMTP_PASS=your_actual_app_password

# Razorpay Configuration (for payments)
RAZORPAY_KEY_ID=your_actual_razorpay_key_id
RAZORPAY_KEY_SECRET=your_actual_razorpay_key_secret
```

### 5. Start the Application

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 6. Configure Web Server (Apache/Nginx)

If using Apache, create a virtual host configuration:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

If using Nginx:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. SSL Certificate (Recommended)

Install SSL certificate for HTTPS:

```bash
# Using Let's Encrypt (if available)
certbot --apache -d yourdomain.com
# or
certbot --nginx -d yourdomain.com
```

## Application Features

### Backend API Endpoints

- `GET /api/health` - Health check
- `POST /api/otp/send` - Send OTP via Twilio
- `POST /api/otp/verify` - Verify OTP
- `POST /api/send-email` - Send email via SMTP
- `POST /api/create-order` - Create Razorpay order
- `POST /api/verify-payment` - Verify Razorpay payment

### Frontend Features

- React SPA with React Router
- Phone verification with Twilio OTP
- Email contact forms
- Payment integration with Razorpay
- Product catalog and gallery
- Responsive design

## Monitoring and Maintenance

### PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart application
pm2 restart hs-globals-website

# Stop application
pm2 stop hs-globals-website

# Monitor resources
pm2 monit
```

### Updates

To update the application:

```bash
# Stop the application
pm2 stop hs-globals-website

# Upload new files
# Update dependencies if needed
npm install --production

# Restart
pm2 start hs-globals-website
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change PORT in .env file
2. **Permission denied**: Check file permissions and ownership
3. **Module not found**: Run `npm install --production`
4. **Twilio errors**: Verify Twilio credentials and phone number format
5. **Email not sending**: Check SMTP credentials and firewall settings

### Logs

Check application logs:
```bash
pm2 logs hs-globals-website
```

Check system logs:
```bash
tail -f /var/log/apache2/error.log  # Apache
tail -f /var/log/nginx/error.log    # Nginx
```

## Support

For deployment issues:
1. Check the logs first
2. Verify environment variables
3. Test API endpoints directly
4. Check server resources (memory, disk space)

The application is now ready for production deployment on GoDaddy!
