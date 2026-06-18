import paramiko, sys

host = '129.121.78.185'
user = 'root'
password = 'Hsglobalexport@8875'

cmd = r"""
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

echo '=== NODE ===' && node -v 2>/dev/null || echo 'node not found'
echo '=== NPM ===' && npm -v 2>/dev/null || echo 'npm not found'
echo '=== PM2 ===' && pm2 list 2>/dev/null || echo 'pm2 not found'
echo '=== NVM VERSIONS ===' && ls ~/.nvm/versions/node/ 2>/dev/null || echo 'nvm not installed'
echo '=== VAR/WWW ===' && ls /var/www/
echo '=== HOME DIR ===' && ls /root/
echo '=== PROCESSES ===' && ps aux | grep -E 'node|pm2' | grep -v grep
echo '=== PORTS ===' && ss -tlnp | grep -E '3000|3001|5173'
"""

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=password, timeout=20)
stdin, stdout, stderr = client.exec_command(cmd)
out = stdout.read().decode()
err = stderr.read().decode()
sys.stdout.buffer.write(out.encode('utf-8'))
if err:
    sys.stdout.buffer.write(b'STDERR: ' + err.encode('utf-8'))
client.close()
