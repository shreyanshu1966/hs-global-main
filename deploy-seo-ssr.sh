#!/bin/bash

###############################################################################
# SEO SSR Server Deployment Script for VPS
#
# This script deploys the SSR server to your VPS for production SEO
#
# Usage: bash deploy-seo-ssr.sh
###############################################################################

echo "╔═══════════════════════════════════════════════╗"
echo "║   🚀 Deploying SEO SSR Server to VPS          ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# Configuration
VPS_IP="YOUR_VPS_IP"                    # Update this
VPS_USER="root"                         # Update if different
VPS_PATH="/var/www/hsglobal"            # Update if different
DOMAIN="www.hsglobalexport.com"         # Your domain

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build frontend
echo -e "${YELLOW}[1/6] Building frontend...${NC}"
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend built successfully${NC}"
echo ""

# Step 2: Create deployment package
echo -e "${YELLOW}[2/6] Creating deployment package...${NC}"
cd ..
mkdir -p deploy-temp
cp -r backend deploy-temp/
cp -r frontend/dist deploy-temp/frontend-dist
cp ecosystem.config.js deploy-temp/
cp package.json deploy-temp/
echo -e "${GREEN}✅ Package created${NC}"
echo ""

# Step 3: Upload to VPS
echo -e "${YELLOW}[3/6] Uploading to VPS...${NC}"
rsync -avz --progress deploy-temp/ ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Upload failed. Check VPS connection${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Uploaded successfully${NC}"
echo ""

# Step 4: Install dependencies on VPS
echo -e "${YELLOW}[4/6] Installing dependencies on VPS...${NC}"
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
cd /var/www/hsglobal
npm install --production
ENDSSH
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 5: Configure PM2
echo -e "${YELLOW}[5/6] Configuring PM2...${NC}"
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
cd /var/www/hsglobal

# Stop existing processes
pm2 delete all 2>/dev/null || true

# Start new processes
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ PM2 configured and running"
ENDSSH
echo -e "${GREEN}✅ PM2 configured${NC}"
echo ""

# Step 6: Configure Nginx
echo -e "${YELLOW}[6/6] Configuring Nginx...${NC}"
ssh ${VPS_USER}@${VPS_IP} << ENDSSH
# Create Nginx config
cat > /etc/nginx/sites-available/hsglobal << 'EOF'
server {
    listen 80;
    server_name ${DOMAIN} hsglobalexport.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # API requests
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static assets with caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:4000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # All other requests (SSR server handles bot detection)
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Pass user agent for bot detection
        proxy_set_header User-Agent \$http_user_agent;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/hsglobal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx

echo "✅ Nginx configured"
ENDSSH

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Deployment Complete!                     ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
echo ""
echo "🌐 Your site is now running at: http://${DOMAIN}"
echo ""
echo "📊 Check PM2 processes:"
echo "   ssh ${VPS_USER}@${VPS_IP} 'pm2 status'"
echo ""
echo "🔍 Test bot detection:"
echo "   curl -A \"facebookexternalhit\" http://${DOMAIN}/products/PRODUCT_SLUG"
echo ""
echo "📝 View logs:"
echo "   ssh ${VPS_USER}@${VPS_IP} 'pm2 logs'"
echo ""

# Cleanup
rm -rf deploy-temp
echo "🧹 Cleaned up temporary files"
echo ""
echo "🎉 Done!"
