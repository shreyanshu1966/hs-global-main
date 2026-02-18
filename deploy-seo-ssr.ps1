# SEO SSR Server Deployment Script for VPS (Windows PowerShell)
#
# This script deploys the SSR server to your VPS for production SEO
#
# Usage: .\deploy-seo-ssr.ps1

###############################################################################
# Configuration - UPDATE THESE
###############################################################################
$VPS_IP = "YOUR_VPS_IP"                    # e.g., "123.45.67.89"
$VPS_USER = "root"                         # Your VPS username
$VPS_PATH = "/var/www/hsglobal"            # Path on VPS
$DOMAIN = "www.hsglobalexport.com"         # Your domain

###############################################################################
# Script Start
###############################################################################

Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🚀 Deploying SEO SSR Server to VPS          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if SSH/SCP is available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SSH not found. Please install OpenSSH or use Git Bash" -ForegroundColor Red
    exit 1
}

# Step 1: Build frontend
Write-Host "[1/6] Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Create deployment package
Write-Host "[2/6] Creating deployment package..." -ForegroundColor Yellow
Set-Location ..
New-Item -ItemType Directory -Force -Path "deploy-temp" | Out-Null
Copy-Item -Path "backend" -Destination "deploy-temp\backend" -Recurse -Force
Copy-Item -Path "frontend\dist" -Destination "deploy-temp\frontend-dist" -Recurse -Force
Copy-Item -Path "ecosystem.config.js" -Destination "deploy-temp\" -Force
Copy-Item -Path "package.json" -Destination "deploy-temp\" -Force
Write-Host "✅ Package created" -ForegroundColor Green
Write-Host ""

# Step 3: Upload to VPS
Write-Host "[3/6] Uploading to VPS..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray

# Use SCP for upload (works on Windows 10+ with OpenSSH)
scp -r deploy-temp/* ${VPS_USER}@${VPS_IP}:${VPS_PATH}/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed. Check VPS connection" -ForegroundColor Red
    Write-Host "   Try: ssh ${VPS_USER}@${VPS_IP}" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Uploaded successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Install dependencies on VPS
Write-Host "[4/6] Installing dependencies on VPS..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_IP} "cd ${VPS_PATH} && npm install --production"
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 5: Configure PM2
Write-Host "[5/6] Configuring PM2..." -ForegroundColor Yellow
$pm2Commands = @"
cd ${VPS_PATH}
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup
"@

ssh ${VPS_USER}@${VPS_IP} $pm2Commands
Write-Host "✅ PM2 configured" -ForegroundColor Green
Write-Host ""

# Step 6: Configure Nginx
Write-Host "[6/6] Configuring Nginx..." -ForegroundColor Yellow

$nginxConfig = @"
server {
    listen 80;
    server_name $DOMAIN hsglobalexport.com;

    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header X-Content-Type-Options \"nosniff\" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # API requests
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
    }

    # Static assets with caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:4000;
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }

    # All other requests (SSR server handles bot detection)
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
        
        # Pass user agent for bot detection
        proxy_set_header User-Agent `$http_user_agent;
    }
}
"@

$nginxCommands = @"
echo '$nginxConfig' > /etc/nginx/sites-available/hsglobal
ln -sf /etc/nginx/sites-available/hsglobal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
"@

ssh ${VPS_USER}@${VPS_IP} $nginxCommands
Write-Host "✅ Nginx configured" -ForegroundColor Green
Write-Host ""

# Success message
Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ Deployment Complete!                     ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your site is now running at: http://$DOMAIN" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Check PM2 processes:" -ForegroundColor Yellow
Write-Host "   ssh ${VPS_USER}@${VPS_IP} 'pm2 status'" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Test bot detection:" -ForegroundColor Yellow
Write-Host "   curl -A `"facebookexternalhit`" http://$DOMAIN/products/PRODUCT_SLUG" -ForegroundColor White
Write-Host ""
Write-Host "📝 View logs:" -ForegroundColor Yellow
Write-Host "   ssh ${VPS_USER}@${VPS_IP} 'pm2 logs'" -ForegroundColor White
Write-Host ""

# Cleanup
Remove-Item -Path "deploy-temp" -Recurse -Force
Write-Host "🧹 Cleaned up temporary files" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Done!" -ForegroundColor Green
