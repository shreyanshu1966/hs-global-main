# Deployment Guide for cPanel

## Prerequisites
- Node.js installed locally
- Access to cPanel File Manager
- Production domain URL

## Step-by-Step Deployment

### 1. Configure Production Environment

Edit `.env.production` file with your production values:

```env
VITE_API_URL=https://yourdomain.com
VITE_EMAILJS_PUBLIC_KEY=your_actual_key
VITE_EMAILJS_SERVICE_ID=your_actual_service_id
VITE_EMAILJS_TEMPLATE_POPUP=your_actual_template
VITE_EMAILJS_TEMPLATE_CONTACT=your_actual_template
VITE_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
```

### 2. Build for Production

Run the following command in the `frontend` directory:

```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### 3. Upload to cPanel

#### Option A: Using File Manager (Recommended for beginners)

1. Login to your cPanel account
2. Open **File Manager**
3. Navigate to `public_html/` (or your domain's document root)
4. **Delete old files** (if updating)
5. **Upload** all files from the `dist/` folder
   - You can zip the `dist` folder, upload the zip, and extract it in cPanel
6. Ensure `.htaccess` file is present (see below)

#### Option B: Using FTP

1. Connect to your server via FTP client (FileZilla, etc.)
2. Navigate to `public_html/`
3. Upload all files from `dist/` folder
4. Set proper permissions (644 for files, 755 for folders)

### 4. Configure .htaccess for React Router

Create/update `.htaccess` in your `public_html/` directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType image/x-icon "access plus 1 year"
</IfModule>
```

### 5. Verify Deployment

1. Visit your domain: `https://yourdomain.com`
2. Check browser console for errors
3. Test API connectivity
4. Verify all routes work correctly

## Updating Environment Variables

### Method 1: Rebuild and Redeploy (Recommended)

1. Update `.env.production` locally
2. Run `npm run build`
3. Upload new `dist/` files to cPanel

### Method 2: Runtime Configuration (Advanced)

If you need to change configs without rebuilding:

1. Create `config.js` in `public/` folder before building
2. Edit `config.js` directly on the server via cPanel File Manager
3. Changes take effect immediately (no rebuild needed)

## Troubleshooting

### Issue: Blank page after deployment
- **Solution**: Check browser console for errors
- Verify API URL in `.env.production` is correct
- Check `.htaccess` is properly configured

### Issue: 404 errors on page refresh
- **Solution**: Ensure `.htaccess` rewrite rules are active
- Verify `mod_rewrite` is enabled in cPanel

### Issue: API calls failing
- **Solution**: Check CORS settings on backend
- Verify `VITE_API_URL` points to correct backend
- Check browser network tab for actual API URLs being called

### Issue: Images/assets not loading
- **Solution**: Verify all files from `dist/` were uploaded
- Check file permissions (644 for files)
- Clear browser cache

## Security Best Practices

1. ✅ Never commit `.env` files to Git
2. ✅ Use HTTPS for production
3. ✅ Keep API keys secure
4. ✅ Enable CORS only for your domain
5. ✅ Regularly update dependencies

## Performance Optimization

1. Enable GZIP compression (see `.htaccess` above)
2. Set proper cache headers
3. Use CDN for static assets (Cloudinary for images)
4. Minify and compress assets (done automatically by Vite)

## Automated Deployment (Optional)

For frequent updates, consider:
- GitHub Actions for CI/CD
- cPanel API for automated uploads
- FTP deployment scripts

---

**Need Help?** Check the logs in cPanel → Errors or browser console for specific error messages.
