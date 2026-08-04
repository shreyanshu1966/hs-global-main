#!/usr/bin/env python3
"""
Upload import-product-specs.js + the filled product-specs.json to the VPS and
run the importer against the LIVE DB.

Dry-run by DEFAULT (no writes). Pass --commit to actually write.

Usage:
  python deploy/vps_run_import.py                 # dry-run against live DB
  python deploy/vps_run_import.py --commit        # WRITE to live DB

Credentials come from deploy/.env.deploy.
"""
import os
import sys
import posixpath

import paramiko

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
ENV_FILE = os.path.join(HERE, '.env.deploy')

SCRIPT = 'import-product-specs.js'
DATA = 'product-specs.json'


def load_env(path):
    env = {}
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip()
    return env


def main():
    commit = '--commit' in sys.argv[1:]

    env = load_env(ENV_FILE)
    host = env.get('VPS_HOST')
    user = env.get('VPS_USER', 'root')
    app_path = env.get('VPS_APP_PATH', '/var/www/hs-global-main')
    key_path = (env.get('VPS_SSH_KEY') or '').strip().strip('"')
    password = (env.get('vps_pass') or env.get('VPS_PASS') or '').strip().strip('"')
    if not host:
        sys.exit('VPS_HOST missing in deploy/.env.deploy')

    local_script = os.path.join(REPO, 'backend', 'scripts', SCRIPT)
    local_data = os.path.join(REPO, 'backend', 'scripts', DATA)
    for p in (local_script, local_data):
        if not os.path.exists(p):
            sys.exit(f'Local file not found: {p}')

    remote_backend = posixpath.join(app_path, 'backend')
    remote_script = posixpath.join(remote_backend, 'scripts', SCRIPT)
    remote_data = posixpath.join(remote_backend, 'scripts', DATA)

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    kw = {'timeout': 30}
    if key_path and os.path.exists(key_path):
        kw['key_filename'] = key_path
        print(f'Connecting to {user}@{host} with SSH key…')
    elif password:
        kw['password'] = password
        print(f'Connecting to {user}@{host} with password…')
    else:
        sys.exit('No SSH key or password in deploy/.env.deploy')
    client.connect(host, username=user, **kw)

    sftp = client.open_sftp()
    sftp.put(local_script, remote_script)
    print(f'Uploaded -> {remote_script}')
    sftp.put(local_data, remote_data)
    print(f'Uploaded -> {remote_data} ({os.path.getsize(local_data):,} bytes)')

    flags = f'--file=scripts/{DATA}' + (' --commit' if commit else '')
    mode = 'COMMIT (WRITES TO LIVE DB)' if commit else 'DRY-RUN (no writes)'
    cmd = (
        'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; '
        f'cd {remote_backend} && node scripts/{SCRIPT} {flags}'
    )
    print(f'\n>>> Running on VPS [{mode}]\n{cmd}\n')
    _in, out, err = client.exec_command(cmd)
    so = out.read().decode('utf-8', errors='replace')
    se = err.read().decode('utf-8', errors='replace')
    rc = out.channel.recv_exit_status()
    if so:
        print(so)
    if se:
        print(se)
    print(f'[exit {rc}]')
    sftp.close()
    client.close()
    if rc != 0:
        sys.exit(f'Failed on VPS (exit {rc}).')
    print('Done.')


if __name__ == '__main__':
    main()
