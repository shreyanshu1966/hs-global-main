#!/usr/bin/env python3
"""
SSH remote command runner used by the Node.js deploy scripts.

Reads a bash script from stdin and executes it on the remote host via SSH.
Supports both SSH key and password authentication.

Usage (called by Node.js scripts, not directly):
  python deploy/ssh-run.py <host> <user>

Environment variables:
  SSH_KEY_PATH  — path to SSH private key (preferred)
  SSH_PASS      — SSH password (fallback when no key)
"""
import paramiko
import select
import sys
import os


def main():
    if len(sys.argv) < 3:
        sys.stderr.write("Usage: python ssh-run.py <host> <user>\n")
        sys.exit(1)

    host = sys.argv[1]
    user = sys.argv[2]
    key_path = os.environ.get('SSH_KEY_PATH', '').strip().replace('\\', '/')
    password = os.environ.get('SSH_PASS', '').strip()
    script = sys.stdin.read()

    if not script.strip():
        sys.stderr.write("No script provided on stdin\n")
        sys.exit(1)

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    connect_kwargs = {'timeout': 30}
    if key_path and os.path.exists(key_path):
        connect_kwargs['key_filename'] = key_path
    elif password:
        connect_kwargs['password'] = password
    else:
        sys.stderr.write("ERROR: No SSH key or password configured.\n")
        sys.stderr.write("  Set VPS_SSH_KEY_PATH or vps_pass in deploy/.env.deploy\n")
        sys.exit(1)

    try:
        client.connect(host, username=user, **connect_kwargs)
    except Exception as e:
        sys.stderr.write(f"SSH connection failed: {e}\n")
        sys.exit(1)

    transport = client.get_transport()
    channel = transport.open_session()
    channel.get_pty(width=220)
    channel.exec_command("bash -l << 'DEPLOY_SCRIPT_EOF'\n" + script + "\nDEPLOY_SCRIPT_EOF")

    while True:
        r, _, _ = select.select([channel], [], [], 1.0)
        if r:
            data = channel.recv(8192)
            if not data:
                break
            sys.stdout.buffer.write(data)
            sys.stdout.buffer.flush()
        if channel.exit_status_ready():
            remaining = channel.recv(65536)
            if remaining:
                sys.stdout.buffer.write(remaining)
                sys.stdout.buffer.flush()
            break

    exit_code = channel.recv_exit_status()
    client.close()
    sys.exit(exit_code)


if __name__ == '__main__':
    main()
