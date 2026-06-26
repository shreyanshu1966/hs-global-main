import paramiko
import sys
import os

host = "129.121.78.185"
user = "root"
password = "Hsglobalexport@8875"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    print("Connecting to VPS...")
    ssh.connect(host, username=user, password=password, timeout=10)
    
    print("Uploading import-csv.js...")
    sftp = ssh.open_sftp()
    sftp.put(r"d:\hs-global-main\backend\import-csv.js", "/var/www/hs-global-main/backend/import-csv.js")
    sftp.put(r"d:\hs-global-main\backend\cross-check.js", "/var/www/hs-global-main/backend/cross-check.js")
    sftp.close()
    
    script = """
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    cd /var/www/hs-global-main/backend
    node cross-check.js
    """
    stdin, stdout, stderr = ssh.exec_command(script)
    
    exit_status = stdout.channel.recv_exit_status()
    print("Output:")
    print(stdout.read().decode())
    print("Error (if any):")
    print(stderr.read().decode())
    print(f"Exit status: {exit_status}")
    
finally:
    ssh.close()
