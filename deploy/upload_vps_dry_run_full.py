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
    
    print("Uploading vps_dry_run_full.js...")
    sftp = ssh.open_sftp()
    sftp.put(r"d:\hs-global-main\backend\vps_dry_run_full.js", "/var/www/hs-global-main/backend/vps_dry_run_full.js")
    
    print("Executing script on VPS...")
    script = """
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    cd /var/www/hs-global-main/backend
    node vps_dry_run_full.js
    """
    stdin, stdout, stderr = ssh.exec_command(script)
    exit_status = stdout.channel.recv_exit_status()
    print("Execution Finished!")
    
    print("Downloading vps_full_data.json...")
    sftp.get("/var/www/hs-global-main/backend/vps_full_data.json", r"d:\hs-global-main\vps_full_data.json")
    sftp.close()
    
    print("All done!")
    
finally:
    ssh.close()
