import paramiko, sys

HOST     = '129.121.78.185'
USER     = 'root'
PASSWORD = 'Hsglobalexport@8875'
APP_PATH = '/var/www/hs-global-main'

def run(client, cmd, label=''):
    sys.stdout.buffer.write(f'\n>>> {label or cmd[:80]}\n'.encode('utf-8'))
    sys.stdout.buffer.flush()
    stdin, stdout, stderr = client.exec_command(
        f'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; {cmd}'
    )
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    rc  = stdout.channel.recv_exit_status()
    if out: sys.stdout.buffer.write(out.encode('utf-8')); sys.stdout.buffer.flush()
    if err: sys.stdout.buffer.write(err.encode('utf-8')); sys.stdout.buffer.flush()
    sys.stdout.buffer.write(f'[exit {rc}]\n'.encode('utf-8'))
    return rc

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

# Start Next.js directly (avoids __dirname resolution issues in ecosystem.config.js)
run(client,
    f'cd {APP_PATH}/frontend-new && pm2 start node_modules/.bin/next --name hs-frontend -- start --port 3001',
    'pm2 start hs-frontend')
run(client, 'sleep 3 && pm2 list', 'pm2 list after 3s')
run(client, 'pm2 save', 'pm2 save')
run(client, 'ss -tlnp | grep 3001', 'check port 3001')
run(client, f'pm2 logs hs-frontend --lines 20 --nostream', 'pm2 logs')

client.close()
