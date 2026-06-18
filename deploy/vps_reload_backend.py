import paramiko, sys

HOST     = '129.121.78.185'
USER     = 'root'
PASSWORD = 'Hsglobalexport@8875'
APP_PATH = '/var/www/hs-global-main'
BRANCH   = 'Home'   # pull latest CORS fix from Home branch

def run(client, cmd, label=''):
    sys.stdout.buffer.write(f'\n>>> {label}\n'.encode('utf-8'))
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

run(client, f'cd {APP_PATH} && git fetch origin {BRANCH} && git reset --hard origin/{BRANCH}', 'git pull Home')
run(client, f'cd {APP_PATH}/backend && npm install --production --silent', 'npm install backend')
run(client, 'pm2 reload project-backend --update-env', 'pm2 reload backend')
run(client, 'pm2 list', 'pm2 list')

client.close()
sys.stdout.buffer.write('\n✅  Backend reloaded with CORS fix!\n'.encode('utf-8'))
sys.stdout.buffer.flush()
