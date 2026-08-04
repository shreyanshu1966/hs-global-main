#!/usr/bin/env python3
"""
Downloads a single file from the VPS over SFTP (binary-safe, no PTY line
limits). Companion to ssh-run.py, used when command output is too large to
stream reliably through a PTY channel.

Usage:
  python deploy/sftp-get.py <host> <user> <remote_path> <local_path>

Environment variables:
  SSH_KEY_PATH  — path to SSH private key (preferred)
  SSH_PASS      — SSH password (fallback when no key)
"""
import paramiko
import sys
import os


def main():
    if len(sys.argv) < 5:
        sys.stderr.write("Usage: python sftp-get.py <host> <user> <remote_path> <local_path>\n")
        sys.exit(1)

    host = sys.argv[1]
    user = sys.argv[2]
    remote_path = sys.argv[3]
    local_path = sys.argv[4]
    key_path = os.environ.get('SSH_KEY_PATH', '').strip().replace('\\', '/')
    password = os.environ.get('SSH_PASS', '').strip()

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    connect_kwargs = {'timeout': 30}
    if key_path and os.path.exists(key_path):
        connect_kwargs['key_filename'] = key_path
    elif password:
        connect_kwargs['password'] = password
    else:
        sys.stderr.write("ERROR: No SSH key or password configured.\n")
        sys.exit(1)

    try:
        client.connect(host, username=user, **connect_kwargs)
        sftp = client.open_sftp()
        sftp.get(remote_path, local_path)
        sftp.close()
    except Exception as e:
        sys.stderr.write(f"SFTP download failed: {e}\n")
        sys.exit(1)
    finally:
        client.close()


if __name__ == '__main__':
    main()
