#!/usr/bin/env python3
"""
Run the product-specs export on the VPS (live DB) and download the JSON.

Steps:
  1. Upload backend/scripts/export-product-specs.js to the VPS.
  2. Run it there (MONGODB_URI on the VPS points at the live DB).
  3. Download the produced product-specs.json back to backend/scripts/.

Read-only against the DB. Credentials come from deploy/.env.deploy.

Usage:
  python deploy/vps_export_specs.py
"""
import os
import sys
import posixpath

import paramiko

# Windows consoles default to cp1252 and choke on the emoji in the script's
# output — force UTF-8 so printing remote stdout never crashes.
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
ENV_FILE = os.path.join(HERE, '.env.deploy')

LOCAL_SCRIPT = os.path.join(REPO, 'backend', 'scripts', 'export-product-specs.js')
LOCAL_OUT = os.path.join(REPO, 'backend', 'scripts', 'product-specs.json')


def load_env(path):
    env = {}
    if not os.path.exists(path):
        return env
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()
    return env


def main():
    env = load_env(ENV_FILE)
    host = env.get('VPS_HOST')
    user = env.get('VPS_USER', 'root')
    app_path = env.get('VPS_APP_PATH', '/var/www/hs-global-main')
    key_path = (env.get('VPS_SSH_KEY') or '').strip().strip('"')
    password = (env.get('vps_pass') or env.get('VPS_PASS') or '').strip().strip('"')

    if not host:
        sys.exit('VPS_HOST missing in deploy/.env.deploy')
    if not os.path.exists(LOCAL_SCRIPT):
        sys.exit(f'Local script not found: {LOCAL_SCRIPT}')

    remote_backend = posixpath.join(app_path, 'backend')
    remote_script = posixpath.join(remote_backend, 'scripts', 'export-product-specs.js')
    remote_out = posixpath.join(remote_backend, 'scripts', 'product-specs.json')

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    connect_kwargs = {'timeout': 30}
    if key_path and os.path.exists(key_path):
        connect_kwargs['key_filename'] = key_path
        print(f'Connecting to {user}@{host} with SSH key…')
    elif password:
        connect_kwargs['password'] = password
        print(f'Connecting to {user}@{host} with password…')
    else:
        sys.exit('No SSH key or password found in deploy/.env.deploy')

    client.connect(host, username=user, **connect_kwargs)

    # 1. Upload the export script (keeps VPS copy in sync with local)
    sftp = client.open_sftp()
    sftp.put(LOCAL_SCRIPT, remote_script)
    print(f'Uploaded export script -> {remote_script}')

    # 2. Run it on the VPS (source nvm so `node` resolves)
    cmd = (
        'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; '
        f'cd {remote_backend} && node scripts/export-product-specs.js --out=scripts/product-specs.json'
    )
    print(f'\n>>> Running export on VPS\n{cmd}\n')
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    rc = stdout.channel.recv_exit_status()
    if out:
        print(out)
    if err:
        print(err)
    print(f'[exit {rc}]')

    if rc != 0:
        sftp.close()
        client.close()
        sys.exit(f'Export failed on VPS (exit {rc}).')

    # 3. Download the produced JSON
    sftp.get(remote_out, LOCAL_OUT)
    size = os.path.getsize(LOCAL_OUT)
    print(f'\nDownloaded -> {LOCAL_OUT} ({size:,} bytes)')

    sftp.close()
    client.close()
    print('Done.')


if __name__ == '__main__':
    main()
