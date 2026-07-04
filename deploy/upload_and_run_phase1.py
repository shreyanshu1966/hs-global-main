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
    
    print("Uploading vps_implement_phase1.js...")
    sftp = ssh.open_sftp()
    sftp.put(r"d:\hs-global-main\backend\vps_implement_phase1.js", "/var/www/hs-global-main/backend/vps_implement_phase1.js")
    sftp.close()
    
    print("Executing Phase 1 on VPS...")
    script = """
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    cd /var/www/hs-global-main/backend
    node vps_implement_phase1.js
    """
    stdin, stdout, stderr = ssh.exec_command(script)
    
    # We will let this run and stream the output to the local console
    for line in iter(stdout.readline, ""):
        print(line, end="")
        
    exit_status = stdout.channel.recv_exit_status()
    print("Error (if any):")
    print(stderr.read().decode())
    print(f"Exit status: {exit_status}")
    
finally:
    ssh.close()
