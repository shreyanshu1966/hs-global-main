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
    
    print("Uploading vps_smart_dry_run.js...")
    sftp = ssh.open_sftp()
    sftp.put(r"d:\hs-global-main\backend\vps_smart_dry_run.js", "/var/www/hs-global-main/backend/vps_smart_dry_run.js")
    
    print("Executing script on VPS...")
    script = """
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    cd /var/www/hs-global-main/backend
    node vps_smart_dry_run.js
    """
    stdin, stdout, stderr = ssh.exec_command(script)
    exit_status = stdout.channel.recv_exit_status()
    print("Execution Finished!")
    
    print("Downloading vps_smart_data.json...")
    sftp.get("/var/www/hs-global-main/backend/vps_smart_data.json", r"d:\hs-global-main\vps_smart_data.json")
    sftp.close()
    
    print("All done!")
    
finally:
    ssh.close()
