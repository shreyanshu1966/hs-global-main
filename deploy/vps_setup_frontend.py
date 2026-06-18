"""
One-time VPS setup for the Next.js frontend:
  1. git pull latest (ecosystem.config.js + frontend-new/)
  2. Write .env.production inside frontend-new/
  3. npm ci + npm run build
  4. Install Nginx config + certbot SSL
  5. PM2 start hs-frontend + pm2 save
"""
import paramiko, sys, textwrap

HOST     = '129.121.78.185'
USER     = 'root'
PASSWORD = 'Hsglobalexport@8875'
APP_PATH = '/var/www/hs-global-main'
BRANCH   = 'main'

ENV_PRODUCTION = textwrap.dedent("""\
    API_URL=https://api.hsglobalexport.com/api
    NEXT_PUBLIC_API_URL=https://api.hsglobalexport.com/api
    NEXT_PUBLIC_SITE_URL=https://www.hsglobalexport.com
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=642596952669-r4jqds27rf85phv8puf2m0pu084r0spj.apps.googleusercontent.com
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dpztytsoz
""")

NGINX_CONF = textwrap.dedent("""\
    server {
        server_name hsglobalexport.com www.hsglobalexport.com;

        client_max_body_size 50m;

        location /_next/static/ {
            proxy_pass http://localhost:3001;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        location / {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 60s;
        }

        listen 80;
    }
""")

def run(client, cmd, label=''):
    sys.stdout.buffer.write(f'\n>>> {label or cmd[:80]}\n'.encode('utf-8'))
    sys.stdout.buffer.flush()
    stdin, stdout, stderr = client.exec_command(
        f'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; {cmd}',
        get_pty=False
    )
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    rc  = stdout.channel.recv_exit_status()
    if out: sys.stdout.buffer.write(out.encode('utf-8')); sys.stdout.buffer.flush()
    if err: sys.stdout.buffer.write(err.encode('utf-8')); sys.stdout.buffer.flush()
    if rc != 0:
        sys.stdout.buffer.write(f'[exit {rc}]\n'.encode('utf-8'))
    return rc

def put_file(sftp, content, remote_path):
    import io
    sftp.putfo(io.BytesIO(content.encode('utf-8')), remote_path)
    sys.stdout.buffer.write(f'    wrote {remote_path}\n'.encode('utf-8'))
    sys.stdout.buffer.flush()

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    sftp = client.open_sftp()

    # 1. git pull  (already done — skip if HEAD is current)
    # run(client, f'cd {APP_PATH} && git fetch origin {BRANCH} && git reset --hard origin/{BRANCH}', 'git pull')

    # 2. Write .env.production  (already written)
    # put_file(sftp, ENV_PRODUCTION, f'{APP_PATH}/frontend-new/.env.production')

    # 3. npm ci  (already done)
    # run(client, f'cd {APP_PATH}/frontend-new && npm ci --prefer-offline', 'npm ci')

    # build  (resume from here)
    run(client, f'cd {APP_PATH}/frontend-new && npm run build', 'next build')

    # 4. Nginx config
    nginx_path = '/etc/nginx/sites-available/hsglobalexport.com.conf'
    enabled    = '/etc/nginx/sites-enabled/hsglobalexport.com.conf'
    put_file(sftp, NGINX_CONF, nginx_path)
    run(client, f'ln -sf {nginx_path} {enabled}', 'enable nginx site')
    run(client, 'nginx -t', 'nginx config test')
    run(client, 'systemctl reload nginx', 'reload nginx')

    # 5. PM2 start / reload
    run(client, f'cd {APP_PATH} && pm2 reload hs-frontend --update-env 2>/dev/null || pm2 start ecosystem.config.js --only hs-frontend --env production', 'pm2 start/reload hs-frontend')
    run(client, 'pm2 save', 'pm2 save')
    run(client, 'pm2 list', 'pm2 list')

    sftp.close()
    client.close()
    msg = (
        '\n✅  VPS frontend setup complete!\n'
        '\nNext steps:\n'
        '  1. Point DNS A records for hsglobalexport.com + www -> 129.121.78.185 in GoDaddy\n'
        '  2. After DNS propagates, run on the VPS:\n'
        '       certbot --nginx -d hsglobalexport.com -d www.hsglobalexport.com\n'
    )
    sys.stdout.buffer.write(msg.encode('utf-8'))
    sys.stdout.buffer.flush()

if __name__ == '__main__':
    main()
