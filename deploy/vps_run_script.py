#!/usr/bin/env python3
"""
Generic: upload a backend/scripts script to the VPS, run it against the live
DB, stream its output back, and optionally pull a resulting file back down.

Usage:
  python deploy/vps_run_script.py --script=fix-zero-product-subcategories.js [--arg=--commit] [--pull=backups/<file>]

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


def arg(name, default=None):
    key = f'--{name}='
    for a in sys.argv[1:]:
        if a.startswith(key):
            return a[len(key):]
    return default


def main():
    script = arg('script')
    if not script:
        sys.exit('Usage: python deploy/vps_run_script.py --script=<name.js> [--arg=<flag>]* [--pull=<relative/path>]')

    extra_args = [a[len('--arg='):] for a in sys.argv[1:] if a.startswith('--arg=')]
    pull_rel = arg('pull')

    env = load_env(ENV_FILE)
    host = env.get('VPS_HOST')
    user = env.get('VPS_USER', 'root')
    app_path = env.get('VPS_APP_PATH', '/var/www/hs-global-main')
    key_path = (env.get('VPS_SSH_KEY') or '').strip().strip('"')
    password = (env.get('vps_pass') or env.get('VPS_PASS') or '').strip().strip('"')
    if not host:
        sys.exit('VPS_HOST missing in deploy/.env.deploy')

    local_script = os.path.join(REPO, 'backend', 'scripts', script)
    if not os.path.exists(local_script):
        sys.exit(f'Local script not found: {local_script}')

    remote_backend = posixpath.join(app_path, 'backend')
    remote_script = posixpath.join(remote_backend, 'scripts', script)

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

    args_str = ' '.join(extra_args)
    cmd = (
        'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; '
        f'cd {remote_backend} && node scripts/{script} {args_str}'
    )
    print(f'\n>>> Running on VPS\n{cmd}\n')
    _in, out, err = client.exec_command(cmd)
    so = out.read().decode('utf-8', errors='replace')
    se = err.read().decode('utf-8', errors='replace')
    rc = out.channel.recv_exit_status()
    if so:
        print(so)
    if se:
        print(se)
    print(f'[exit {rc}]')

    if rc == 0 and pull_rel:
        remote_pull = posixpath.join(remote_backend, pull_rel)
        local_pull = os.path.join(REPO, 'backend', pull_rel.replace('/', os.sep))
        os.makedirs(os.path.dirname(local_pull), exist_ok=True)
        try:
            sftp.get(remote_pull, local_pull)
            print(f'\nDownloaded -> {local_pull}')
        except Exception as e:
            print(f'\n(no file pulled: {e})')

    sftp.close()
    client.close()
    if rc != 0:
        sys.exit(f'Failed on VPS (exit {rc}).')


if __name__ == '__main__':
    main()
