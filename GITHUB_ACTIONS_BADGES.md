# GitHub Actions Status Badges

Add these badges to your README.md to show deployment status:

## Deployment Status Badge

```markdown
![Frontend Deployment](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/deploy-frontend.yml/badge.svg)
```

**Replace:**
- `YOUR_USERNAME` with your GitHub username or organization
- `YOUR_REPO_NAME` with your repository name

Example:
```markdown
![Frontend Deployment](https://github.com/hsglobalexport/hs-global-main/actions/workflows/deploy-frontend.yml/badge.svg)
```

## Badge with Link

Make the badge clickable to view deployment history:

```markdown
[![Frontend Deployment](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/deploy-frontend.yml)
```

## Complete README Section Example

```markdown
## 🚀 Deployment

### Frontend
[![Deploy Frontend](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/deploy-frontend.yml)

The frontend automatically deploys to [hsglobalexport.com](https://www.hsglobalexport.com) when changes are pushed to the `main` branch.

**Live Site:** https://www.hsglobalexport.com

**Deployment Pipeline:**
- ✅ Automated builds on push to main
- ✅ Optimized production builds with Vite
- ✅ Direct deployment to cPanel via FTP
- ✅ Manual deployment option available

See [FRONTEND_CI_CD_QUICK_REF.md](FRONTEND_CI_CD_QUICK_REF.md) for quick reference or [FRONTEND_DEPLOYMENT_GUIDE.md](FRONTEND_DEPLOYMENT_GUIDE.md) for detailed documentation.
```

## Badge Color Meanings

- ![Green Badge](https://img.shields.io/badge/build-passing-brightgreen) - All deployments successful
- ![Red Badge](https://img.shields.io/badge/build-failing-red) - Last deployment failed
- ![Yellow Badge](https://img.shields.io/badge/build-unknown-yellow) - No deployments yet or badge not configured

## Additional Status Options

### Branch-Specific Badge
```markdown
![Frontend Deployment](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/deploy-frontend.yml/badge.svg?branch=main)
```

### Event-Specific Badge
```markdown
![Frontend Deployment](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/deploy-frontend.yml/badge.svg?event=push)
```

---

**Note:** Badges update automatically and show real-time status of your deployments.
