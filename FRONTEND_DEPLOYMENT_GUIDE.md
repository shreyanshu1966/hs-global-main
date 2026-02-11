# Frontend CI/CD Pipeline - cPanel Deployment Guide

## Overview
This guide explains how to set up and use the automated CI/CD pipeline for deploying the frontend to cPanel hosting.

## Pipeline Features
- ✅ Automatic deployment on push to `main` branch
- ✅ Manual deployment option via GitHub Actions tab
- ✅ Only triggers when frontend files change
- ✅ Optimized build with Vite
- ✅ Secure FTP deployment to cPanel
- ✅ Production-optimized assets

## How It Works

### 1. Trigger
The pipeline runs when:
- Code is pushed to the `main` branch AND changes are in the `frontend/` directory
- Manually triggered from GitHub Actions tab (workflow_dispatch)

### 2. Build Process
1. Checks out the latest code
2. Sets up Node.js 20
3. Installs dependencies using `npm ci` (faster and more reliable than `npm install`)
4. Builds the frontend with `npm run build`
   - Output goes to `frontend/dist/` directory
   - All assets are optimized for production

### 3. Deployment
- Uses FTP to upload built files to cPanel
- Deploys to `/public_html/` directory on your cPanel server
- Only uploads changed files (efficient)

## Setup Instructions

### Step 1: Configure GitHub Secrets
You need to add FTP credentials as GitHub Secrets (not in the code for security).

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these three secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `FTP_HOST` | Your cPanel FTP server | `sg2plzcpnl509436.prod.sin2.secureserver.net` |
| `FTP_USER` | FTP username for main site | `cpanel_username@hsglobalexport.com` |
| `FTP_PASSWORD` | FTP password | Your secure password |

**⚠️ Important Notes:**
- `FTP_HOST`: Use your cPanel's FTP server (found in cPanel → FTP Accounts)
- `FTP_USER`: For the main website, use the main FTP account (not the video@ one)
- `FTP_PASSWORD`: Keep this secure, never commit it to the repository
- The `server-dir` is set to `/public_html/` which is the standard cPanel web root

### Step 2: Verify cPanel FTP Account
1. Log into cPanel
2. Go to **Files** → **FTP Accounts**
3. Find or create an FTP account with access to `/public_html/`
4. Use these credentials for the GitHub Secrets

### Step 3: Test the Pipeline

#### Option A: Automatic Deployment
1. Make a change to any file in the `frontend/` directory
2. Commit and push to the `main` branch:
   ```bash
   git add .
   git commit -m "test: trigger frontend deployment"
   git push origin main
   ```
3. Watch the deployment progress:
   - Go to GitHub repository → **Actions** tab
   - Click on your workflow run
   - Monitor the build and deployment steps

#### Option B: Manual Deployment
1. Go to GitHub repository → **Actions** tab
2. Click **Deploy Frontend to cPanel** workflow
3. Click **Run workflow** button
4. Select `main` branch
5. Click **Run workflow**

## Monitoring Deployments

### GitHub Actions Dashboard
- View all deployment runs in the **Actions** tab
- See real-time logs for each step
- Get notifications on success/failure

### Deployment Logs
Each deployment shows:
- ✓ Code checkout status
- ✓ Dependency installation progress
- ✓ Build output and any warnings
- ✓ FTP upload progress
- ✓ Total files deployed

## Directory Structure

```
hs-global-main/
├── frontend/
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── dist/             # Built files (generated, not committed)
│   ├── package.json
│   └── vite.config.js
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml   # CI/CD pipeline
└── backend/              # Not affected by this pipeline
```

## Customization Options

### Change Deployment Branch
Edit `.github/workflows/deploy-frontend.yml`:
```yaml
on:
  push:
    branches:
      - production  # Change from 'main' to your branch
```

### Change Deployment Directory
If your cPanel uses a different directory:
```yaml
server-dir: /public_html/subdirectory/  # Add subdirectory if needed
```

### Add Environment Variables
If your build needs environment variables:
```yaml
- name: Build frontend
  working-directory: ./frontend
  run: npm run build
  env:
    NODE_ENV: production
    VITE_API_URL: ${{ secrets.API_URL }}  # Add custom variables
```

## Troubleshooting

### Build Fails
**Issue**: `npm run build` fails
- Check the Action logs for specific error messages
- Ensure all dependencies are in `package.json`
- Test the build locally: `cd frontend && npm run build`

### FTP Connection Fails
**Issue**: "Failed to connect to FTP server"
- Verify `FTP_HOST` secret is correct
- Check if cPanel FTP is enabled
- Ensure your GitHub Actions IP isn't blocked by hosting provider
- Try connecting manually with FileZilla to verify credentials

### Files Not Updating
**Issue**: Website shows old content after deployment
- Clear browser cache (Ctrl+F5)
- Check if cPanel has caching enabled
- Verify files were uploaded: check FTP or cPanel File Manager
- Check the Action logs to see which files were uploaded

### Wrong Directory
**Issue**: Files uploaded to wrong location
- Check `server-dir` in workflow file
- Verify the path with your hosting provider
- Common cPanel paths: `/public_html/`, `/public_html/www/`, `/home/username/public_html/`

## Security Best Practices

✅ **DO:**
- Store all credentials in GitHub Secrets
- Use strong FTP passwords
- Limit FTP account access to only `/public_html/`
- Enable 2FA on your GitHub account
- Regularly rotate FTP passwords

❌ **DON'T:**
- Commit credentials to the repository
- Share FTP credentials in issues or pull requests
- Use the same password for multiple services
- Disable security features for convenience

## Performance Tips

1. **Build Optimization**: Already configured in `vite.config.js`
2. **Caching**: GitHub Actions caches `node_modules` for faster builds
3. **Incremental Uploads**: Only changed files are uploaded
4. **Compression**: Vite automatically minifies and compresses assets

## Backup Recommendations

Before each deployment:
1. cPanel automatically keeps backups (check with your host)
2. Consider downloading `/public_html/` occasionally as a manual backup
3. Git itself serves as source code backup

## Support

If you encounter issues:
1. Check the **Actions** tab for detailed error logs
2. Verify all GitHub Secrets are set correctly
3. Test FTP credentials manually with an FTP client
4. Ensure your cPanel account has sufficient permissions

## Quick Commands

```bash
# Test build locally
cd frontend
npm install
npm run build

# Check built files
ls -la dist/

# Manual FTP upload (alternative to CI/CD)
# Use FileZilla or similar FTP client
# Connect to: sg2plzcpnl509436.prod.sin2.secureserver.net
# Upload dist/ contents to /public_html/
```

## Success Checklist

- [ ] GitHub Secrets configured (FTP_HOST, FTP_USER, FTP_PASSWORD)
- [ ] FTP credentials verified in cPanel
- [ ] First deployment tested and successful
- [ ] Website accessible at https://www.hsglobalexport.com
- [ ] FTP account limited to necessary directory only
- [ ] Team members aware of deployment process

---

**Last Updated**: February 2026
**Maintained By**: Development Team
