# Frontend CI/CD Quick Reference

## 🚀 Quick Setup (5 Minutes)

### 1. Add GitHub Secrets
Go to: `GitHub Repo → Settings → Secrets and variables → Actions → New repository secret`

Add these 3 secrets:
```
FTP_HOST = sg2plzcpnl509436.prod.sin2.secureserver.net
FTP_USER = your_cpanel_ftp_username@hsglobalexport.com
FTP_PASSWORD = your_secure_ftp_password
```

### 2. Deploy
**Option A - Auto:** Push to main branch
```bash
git add .
git commit -m "deploy: update frontend"
git push origin main
```

**Option B - Manual:** Go to Actions tab → Run workflow

---

## 📋 Deployment Checklist

Before first deployment:
- [ ] GitHub Secrets configured
- [ ] FTP credentials tested in cPanel
- [ ] Main branch protected (optional)

For each deployment:
- [ ] Code tested locally (`npm run build`)
- [ ] Changes reviewed
- [ ] Commit message is clear

After deployment:
- [ ] Check Actions tab for success ✅
- [ ] Visit https://www.hsglobalexport.com
- [ ] Clear cache (Ctrl+F5)
- [ ] Test critical functionality

---

## 🔍 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check Actions logs, run `npm run build` locally |
| FTP fails | Verify GitHub Secrets, check cPanel FTP settings |
| Old content shows | Clear browser cache, check if files uploaded |
| Wrong directory | Verify `server-dir` in workflow file |

---

## 🏗️ Pipeline Flow

```
Push to main (frontend/** changes)
    ↓
GitHub Actions triggered
    ↓
Install Node.js & dependencies
    ↓
Build frontend (npm run build)
    ↓
Upload dist/ to cPanel via FTP
    ↓
Live at www.hsglobalexport.com ✨
```

---

## 📁 Important Files

- **Pipeline**: `.github/workflows/deploy-frontend.yml`
- **Build output**: `frontend/dist/` (auto-generated, not committed)
- **Deploy target**: cPanel `/public_html/`
- **Full guide**: `FRONTEND_DEPLOYMENT_GUIDE.md`

---

## 🛠️ Local Testing

```bash
# Build locally
cd frontend
npm install
npm run build

# Check output
ls dist/

# Preview build
npm run preview
```

---

## 🔐 Security Reminders

✅ Never commit FTP credentials
✅ Use GitHub Secrets for sensitive data
✅ Limit FTP account to /public_html/ only
✅ Rotate passwords regularly

---

## Common Commands

```bash
# Watch deployment
# Go to: GitHub → Actions tab

# Force deployment
# Actions → Deploy Frontend to cPanel → Run workflow

# Rollback (manual)
# Use cPanel File Manager or FTP to restore backup
```

---

**Need help?** Check `FRONTEND_DEPLOYMENT_GUIDE.md` for detailed instructions.
