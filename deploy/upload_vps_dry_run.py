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
    
    print("Uploading vps_dry_run.js and cloudinary_all_api_assets.json...")
    sftp = ssh.open_sftp()
    sftp.put(r"d:\hs-global-main\backend\vps_dry_run.js", "/var/www/hs-global-main/backend/vps_dry_run.js")
    sftp.put(r"d:\hs-global-main\cloudinary_all_api_assets.json", "/var/www/hs-global-main/backend/cloudinary_all_api_assets.json")
    sftp.close()
    
    print("Executing script on VPS...")
    script = """
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    cd /var/www/hs-global-main/backend
    npm install dotenv
    node vps_dry_run.js
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
