import paramiko
import sys
import os
from datetime import datetime

host = "129.121.78.185"
user = "root"
password = "Hsglobalexport@8875"

backup_dir_local = r"d:\hs-global-main\backend\backups"
if not os.path.exists(backup_dir_local):
    os.makedirs(backup_dir_local)

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_filename = f"hs_global_export_live_{timestamp}.tar.gz"
local_backup_path = os.path.join(backup_dir_local, backup_filename)
remote_backup_dir = f"/var/www/hs-global-main/backend/backups/dump_{timestamp}"
remote_tar_path = f"/var/www/hs-global-main/backend/backups/{backup_filename}"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    print("Connecting to VPS to perform MongoDB backup...")
    ssh.connect(host, username=user, password=password, timeout=10)
    
    print("Executing mongodump on VPS...")
    script = f"""
    mkdir -p /var/www/hs-global-main/backend/backups
    mongodump --db hs_global_export --out {remote_backup_dir}
    cd /var/www/hs-global-main/backend/backups
    tar -czf {backup_filename} dump_{timestamp}
    """
    stdin, stdout, stderr = ssh.exec_command(script)
    exit_status = stdout.channel.recv_exit_status()
    print("Mongodump Output:")
    print(stdout.read().decode())
    print("Error (if any):")
    print(stderr.read().decode())
    
    if exit_status == 0:
        print(f"Downloading backup to {local_backup_path}...")
        sftp = ssh.open_sftp()
        sftp.get(remote_tar_path, local_backup_path)
        sftp.close()
        print("Backup downloaded successfully!")
    else:
        print("Backup failed on VPS. Not downloading.")
        
finally:
    ssh.close()
