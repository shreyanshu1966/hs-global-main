# Cloudflare Configuration Guide

This guide walks you through setting up Cloudflare CDN for your HS Global website.

---

## 🎯 What Cloudflare Does

- **CDN Caching**: Caches your Cloudinary images at edge servers worldwide
- **Bandwidth Savings**: Reduces Cloudinary bandwidth usage by 90-95%
- **DDoS Protection**: Protects against attacks
- **SSL/TLS**: Free SSL certificates
- **Performance**: Faster page loads globally

---

## 📋 Prerequisites

- [ ] Domain name (e.g., hsglobal.com)
- [ ] Access to domain registrar (GoDaddy, Namecheap, etc.)
- [ ] Cloudinary already set up
- [ ] Website deployed to VPS

---

## STEP 1: Create Cloudflare Account

1. Go to: https://dash.cloudflare.com/sign-up
2. Enter your email and create password
3. Verify email address
4. Log in to dashboard

**Cost: FREE** ✅

---

## STEP 2: Add Your Domain

1. Click **"Add a Site"** button
2. Enter your domain (e.g., `hsglobal.com`)
3. Click **"Add site"**
4. Select **"Free"** plan
5. Click **"Continue"**

Cloudflare will scan your existing DNS records (takes ~60 seconds).

---

## STEP 3: Review DNS Records

Cloudflare will import your existing DNS records. Verify these are correct:

### Required Records:

```
Type    Name    Content              Proxy Status
A       @       YOUR_VPS_IP          Proxied (orange cloud)
A       www     YOUR_VPS_IP          Proxied (orange cloud)
CNAME   api     yourdomain.com       Proxied (orange cloud)
```

**Important:**
- ✅ Orange cloud = Proxied through Cloudflare (CDN enabled)
- ⚠️ Gray cloud = DNS only (no CDN)
- Make sure all web traffic records are **Proxied (orange)**

Click **"Continue"** when done.

---

## STEP 4: Update Nameservers

Cloudflare will provide 2 nameservers like:

```
ns1.cloudflare.com
ns2.cloudflare.com
```

### Update at Your Domain Registrar:

#### GoDaddy:
1. Log in to GoDaddy
2. Go to **My Products** → **Domains**
3. Click on your domain
4. Click **"Manage DNS"**
5. Scroll to **"Nameservers"**
6. Click **"Change"**
7. Select **"Custom"**
8. Enter Cloudflare nameservers
9. Click **"Save"**

#### Namecheap:
1. Log in to Namecheap
2. Go to **Domain List**
3. Click **"Manage"** next to your domain
4. Find **"Nameservers"** section
5. Select **"Custom DNS"**
6. Enter Cloudflare nameservers
7. Click **"Save"**

#### Other Registrars:
- Look for "DNS Settings" or "Nameservers"
- Change to "Custom" nameservers
- Enter Cloudflare's nameservers

**Propagation Time: 24-48 hours** (usually faster)

Click **"Done, check nameservers"** in Cloudflare.

---

## STEP 5: SSL/TLS Configuration

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode: **Full (strict)**

### Why Full (strict)?
- Encrypts traffic between visitor and Cloudflare
- Encrypts traffic between Cloudflare and your VPS
- Most secure option

### Install Origin Certificate on VPS:

1. Go to **SSL/TLS** → **Origin Server**
2. Click **"Create Certificate"**
3. Keep defaults (RSA, 15 years)
4. Click **"Create"**
5. Copy both:
   - Origin Certificate (save as `cloudflare-cert.pem`)
   - Private Key (save as `cloudflare-key.pem`)

6. Upload to VPS:
```bash
# On your VPS
sudo mkdir -p /etc/ssl/cloudflare
sudo nano /etc/ssl/cloudflare/cert.pem
# Paste Origin Certificate

sudo nano /etc/ssl/cloudflare/key.pem
# Paste Private Key

sudo chmod 600 /etc/ssl/cloudflare/key.pem
```

7. Update Nginx config (see STEP 9)

---

## STEP 6: Speed Optimization

Go to **Speed** → **Optimization**

### Enable These Settings:

#### Auto Minify:
- ✅ JavaScript
- ✅ CSS
- ✅ HTML

#### Brotli:
- ✅ Enable

#### Rocket Loader (Optional):
- ⚠️ Test first (may break some JS)
- Start with **OFF**, enable later if needed

#### Early Hints:
- ✅ Enable (improves performance)

---

## STEP 7: Caching Configuration

Go to **Caching** → **Configuration**

### Cache Settings:

1. **Caching Level**: Standard
2. **Browser Cache TTL**: 1 year
3. **Always Online**: ON (serves cached version if origin is down)
4. **Development Mode**: OFF (only enable when testing)

### Purge Cache (when needed):

- **Purge Everything**: Clears all cached files
- **Purge by URL**: Clear specific files
- **Purge by Tag**: Advanced (not needed now)

---

## STEP 8: Page Rules (CRITICAL!)

Go to **Rules** → **Page Rules**

Free plan includes **3 page rules**. Use them wisely!

### Rule 1: Cache Cloudinary Images

```
URL Pattern: *res.cloudinary.com/*

Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 year
```

**Why?** This caches Cloudinary images at Cloudflare edge, reducing Cloudinary bandwidth by 90%+

### Rule 2: Cache Static Assets

```
URL Pattern: *yourdomain.com/assets/*

Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 year
```

**Why?** Caches your built JS/CSS files

### Rule 3: Bypass API Cache

```
URL Pattern: *yourdomain.com/api/*

Settings:
- Cache Level: Bypass
```

**Why?** Don't cache API responses (they're dynamic)

**Save each rule** after creating.

---

## STEP 9: Update Nginx Configuration

Update your Nginx config to work with Cloudflare:

```nginx
# /etc/nginx/sites-available/hsglobal.conf

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # Cloudflare Origin Certificate
    ssl_certificate /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Get real visitor IP from Cloudflare
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 2400:cb00::/32;
    set_real_ip_from 2606:4700::/32;
    set_real_ip_from 2803:f800::/32;
    set_real_ip_from 2405:b500::/32;
    set_real_ip_from 2405:8100::/32;
    set_real_ip_from 2a06:98c0::/29;
    set_real_ip_from 2c0f:f248::/32;
    real_ip_header CF-Connecting-IP;

    # Frontend (React SPA)
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Pass real IP from Cloudflare
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Don't cache API responses
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

**Apply configuration:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## STEP 10: Verify Setup

### Check DNS Propagation:

```bash
# Check if nameservers updated
nslookup -type=NS yourdomain.com

# Should show Cloudflare nameservers
```

### Check Cloudflare is Active:

```bash
# Check HTTP headers
curl -I https://yourdomain.com

# Look for these headers:
# cf-cache-status: HIT (or MISS on first request)
# cf-ray: xxxxx-XXX
# server: cloudflare
```

### Check SSL:

Visit: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com

**Target: A or A+ rating**

---

## STEP 11: Performance Testing

### Test Cache Hit Rate:

1. Visit your website
2. Refresh page (Ctrl+F5)
3. Check Network tab in browser DevTools
4. Look for `cf-cache-status: HIT` in response headers

**Target: >90% cache hit rate**

### Test Page Speed:

1. **Google PageSpeed Insights**: https://pagespeed.web.dev/
   - Enter your URL
   - Target: 90+ score

2. **GTmetrix**: https://gtmetrix.com/
   - Enter your URL
   - Target: A grade

3. **WebPageTest**: https://www.webpagetest.org/
   - Enter your URL
   - Target: <2s load time

---

## 📊 Monitoring

### Cloudflare Analytics

Go to **Analytics & Logs** → **Traffic**

**Key Metrics:**
- **Requests**: Total requests served
- **Bandwidth**: Data transferred
- **Cached**: Percentage of cached requests (target: >80%)
- **SSL**: Encrypted traffic percentage (should be 100%)

### Bandwidth Savings:

Go to **Analytics & Logs** → **Performance**

**Look for:**
- **Saved Bandwidth**: How much Cloudflare saved
- **Cache Hit Ratio**: Percentage of requests served from cache

**Expected:**
- Cache hit ratio: 85-95%
- Bandwidth savings: 80-90%

---

## 🚨 Troubleshooting

### Issue: Website Not Loading

**Check:**
1. Nameservers updated? (24-48 hours)
2. DNS records correct?
3. SSL mode set to "Full (strict)"?
4. Origin certificate installed on VPS?

**Fix:**
```bash
# Check Nginx is running
sudo systemctl status nginx

# Check SSL certificate
sudo nginx -t
```

### Issue: Images Not Loading

**Check:**
1. Page rule for Cloudinary created?
2. Cloudinary URLs correct in code?
3. CORS configured?

**Fix:**
- Purge Cloudflare cache
- Check browser console for errors

### Issue: API Not Working

**Check:**
1. Page rule bypassing API cache?
2. Nginx proxy configuration correct?
3. Backend running?

**Fix:**
```bash
# Check backend is running
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Issue: Low Cache Hit Rate (<50%)

**Possible Causes:**
1. Page rules not configured correctly
2. Cache-Control headers preventing caching
3. Query strings in URLs

**Fix:**
1. Review page rules
2. Check response headers
3. Enable "Cache Query Strings" in Cloudflare

---

## 🎯 Expected Results

### Before Cloudflare:
- Cloudinary bandwidth: 25 GB/month (approaching limit)
- Page load: 2-3 seconds
- No DDoS protection

### After Cloudflare:
- Cloudinary bandwidth: 2-5 GB/month (90% reduction!) ✅
- Page load: 1-2 seconds ✅
- DDoS protection: Included ✅
- SSL: Free ✅
- Global CDN: 200+ locations ✅

---

## 💰 Cost Summary

```
Cloudflare Free Plan:
├── Bandwidth: Unlimited ✅
├── DDoS Protection: Included ✅
├── SSL Certificate: Free ✅
├── CDN: 200+ locations ✅
├── Page Rules: 3 included ✅
└── Cost: ₹0/month ✅

Total Monthly Cost:
├── Hostinger KVM 2: ₹599
├── Cloudinary: ₹0 (free tier)
├── Cloudflare: ₹0 (free tier)
└── Total: ₹599/month
```

---

## ✅ Post-Setup Checklist

- [ ] Cloudflare account created
- [ ] Domain added to Cloudflare
- [ ] Nameservers updated at registrar
- [ ] DNS records configured (proxied)
- [ ] SSL/TLS set to "Full (strict)"
- [ ] Origin certificate installed on VPS
- [ ] Speed optimizations enabled
- [ ] Caching configured
- [ ] 3 page rules created
- [ ] Nginx updated with Cloudflare IPs
- [ ] Website accessible via HTTPS
- [ ] Cache hit rate >80%
- [ ] PageSpeed score >90
- [ ] Monitoring set up

---

## 🚀 Advanced Features (Optional)

### Cloudflare Workers (Free tier: 100,000 requests/day)

Use for:
- Image resizing on-the-fly
- A/B testing
- Geo-redirects
- Custom caching logic

### Cloudflare Analytics (Free)

- Real-time traffic monitoring
- Bot detection
- Security insights

### Cloudflare Firewall (Free)

- Block countries
- Block IPs
- Rate limiting (5 rules free)

---

## 📞 Support

- **Cloudflare Community**: https://community.cloudflare.com/
- **Cloudflare Docs**: https://developers.cloudflare.com/
- **Status Page**: https://www.cloudflarestatus.com/

---

**Setup Complete! 🎉**

Your website is now powered by:
- ✅ Cloudinary (image optimization)
- ✅ Cloudflare (CDN + security)
- ✅ Hostinger KVM 2 (backend)

**Total cost: ₹599/month**
**Performance: Excellent**
**Scalability: 2000+ visitors/day**
