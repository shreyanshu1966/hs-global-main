import paramiko, sys, io

HOST     = '129.121.78.185'
USER     = 'root'
PASSWORD = 'Hsglobalexport@8875'
APP_PATH = '/var/www/hs-global-main'

def run(client, cmd, label):
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

sftp = client.open_sftp()

# Upload enriched CSV (has hs_product_id = productCode column)
sftp.put(
    r'd:\hs-global-main\All in One HSGlobal & Etsy Data Update - Live Website HS Global Export_with_ids.csv',
    f'{APP_PATH}/All in One HSGlobal & Etsy Data Update - Live Website HS Global Export_with_ids.csv'
)
sys.stdout.buffer.write(b'Uploaded updated CSV\n'); sys.stdout.buffer.flush()

# Upload updated import script (has --dry-run support)
sftp.put(
    r'd:\hs-global-main\backend\scripts\import-seo-from-csv-fixed.js',
    f'{APP_PATH}/backend/scripts/import-seo-from-csv-fixed.js'
)
sys.stdout.buffer.write(b'Uploaded updated import script\n'); sys.stdout.buffer.flush()
sftp.close()

run(client,
    f'cd {APP_PATH}/backend && node scripts/import-seo-from-csv-fixed.js',
    'SEO import — live run')

client.close()
