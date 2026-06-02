# One-Time VPS Setup (DigitalOcean Droplet)

Run these commands on your server **once**. After this, every deploy is just
`node deploy/deploy-backend.js` from your laptop.

---

## 1. Connect to the VPS

```bash
ssh root@YOUR_DROPLET_IP
```

---

## 2. Install Node.js (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v   # should print v20.x.x
```

---

## 3. Install PM2

```bash
npm install -g pm2
pm2 startup   # follow the printed command to enable auto-start on reboot
```

---

## 4. Clone the repo

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git hs-global
cd hs-global
```

> If the repo is private, create a GitHub Deploy Key:
> ```bash
> ssh-keygen -t ed25519 -C "deploy@vps" -f ~/.ssh/github_deploy
> cat ~/.ssh/github_deploy.pub   # add this as a Deploy Key in GitHub repo settings
> # Add to SSH config:
> echo "Host github.com
>   IdentityFile ~/.ssh/github_deploy" >> ~/.ssh/config
> ```

---

## 5. Install backend dependencies

```bash
cd /var/www/hs-global/backend
npm install --production
```

---

## 6. Create the production .env

```bash
cp /var/www/hs-global/backend/.env.example /var/www/hs-global/backend/.env
nano /var/www/hs-global/backend/.env
```

Fill in all your production secrets (MongoDB URI, Cloudinary, JWT secret, etc.).

---

## 7. Start the app with PM2

```bash
cd /var/www/hs-global
pm2 start ecosystem.config.js --env production
pm2 save   # persist across reboots
pm2 logs hs-backend-api   # verify it's running
```

---

## 8. (Optional but Recommended) Nginx reverse proxy

If you want your API to be accessible at `https://api.yourdomain.com` instead of
`http://IP:3000`, install Nginx:

```bash
apt update && apt install -y nginx certbot python3-certbot-nginx

# Create site config
cat > /etc/nginx/sites-available/hs-global-api << 'EOF'
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/hs-global-api /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Free SSL certificate
certbot --nginx -d api.yourdomain.com
```

---

## Done

From now on, deploying the backend from your laptop is just:

```bash
node deploy/deploy.js --backend
```
