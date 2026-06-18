"""
Upload the live-website SEO CSV to the VPS, run add-product-id-to-csv.js
(which matches URLs against MongoDB and adds an hs_product_id column),
then download the enriched CSV back to local disk.

Usage:
    python deploy/vps_add_product_ids.py            # full run
    python deploy/vps_add_product_ids.py --dry-run  # preview only (no file written)
"""

import paramiko, sys, os

HOST     = '129.121.78.185'
USER     = 'root'
PASSWORD = 'Hsglobalexport@8875'
APP_PATH = '/var/www/hs-global-main'

DRY_RUN = '--dry-run' in sys.argv

LOCAL_CSV_IN  = r'd:\hs-global-main\All in One HSGlobal & Etsy Data Update - Live Website HS Global Export.csv'
LOCAL_CSV_OUT = r'd:\hs-global-main\All in One HSGlobal & Etsy Data Update - Live Website HS Global Export_with_ids.csv'
REMOTE_CSV_IN  = f'{APP_PATH}/All in One HSGlobal & Etsy Data Update - Live Website HS Global Export.csv'
REMOTE_CSV_OUT = f'{APP_PATH}/All in One HSGlobal & Etsy Data Update - Live Website HS Global Export_with_ids.csv'
REMOTE_SCRIPT  = f'{APP_PATH}/backend/scripts/add-product-id-to-csv.js'

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

print(f'\n=== vps_add_product_ids {"[DRY RUN]" if DRY_RUN else ""} ===\n')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

sftp = client.open_sftp()

# Upload the CSV
print('Uploading CSV ...')
sftp.put(LOCAL_CSV_IN, REMOTE_CSV_IN)
print('  done')

# Upload the script
print('Uploading script ...')
sftp.put(r'd:\hs-global-main\backend\scripts\add-product-id-to-csv.js', REMOTE_SCRIPT)
print('  done')

sftp.close()

# Install csv-stringify if not already present
run(client,
    f'cd {APP_PATH}/backend && npm install csv-stringify --save 2>&1',
    'npm install csv-stringify')

# Run the script
flag = '--dry-run' if DRY_RUN else ''
rc = run(client,
    f'cd {APP_PATH}/backend && node scripts/add-product-id-to-csv.js {flag}',
    f'Running add-product-id-to-csv {flag}')

if rc != 0:
    print(f'\nScript exited with code {rc} — not downloading output.')
    client.close()
    sys.exit(rc)

# Download the enriched CSV back (skip on dry run since nothing is written)
if not DRY_RUN:
    sftp = client.open_sftp()
    print(f'\nDownloading enriched CSV ...')
    sftp.get(REMOTE_CSV_OUT, LOCAL_CSV_OUT)
    sftp.close()
    print(f'  saved to: {LOCAL_CSV_OUT}')

client.close()
print('\nDone.')
