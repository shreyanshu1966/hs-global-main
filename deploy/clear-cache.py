import paramiko
import sys
import os

host = "129.121.78.185"
user = "root"
password = "Hsglobalexport@8875"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    print("Connecting to VPS to clear Next.js cache...")
    ssh.connect(host, username=user, password=password, timeout=10)
    
    script = """
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    cd /var/www/hs-global-main/frontend-new
    rm -rf .next/cache/fetch-cache
    pm2 reload hs-frontend
    """
    stdin, stdout, stderr = ssh.exec_command(script)
    
    exit_status = stdout.channel.recv_exit_status()
    print("Output:")
    print(stdout.read().decode())
    print(f"Exit status: {exit_status}")
    
finally:
    ssh.close()
