import paramiko, sys, io

HOST     = '129.121.78.185'
USER     = 'root'
PASSWORD = 'Hsglobalexport@8875'

CERT = """-----BEGIN CERTIFICATE-----
MIIEsDCCA5igAwIBAgIUWBT8yTnVCviaEnhvFyMbqN39Im0wDQYJKoZIhvcNAQEL
BQAwgYsxCzAJBgNVBAYTAlVTMRkwFwYDVQQKExBDbG91ZEZsYXJlLCBJbmMuMTQw
MgYDVQQLEytDbG91ZEZsYXJlIE9yaWdpbiBTU0wgQ2VydGlmaWNhdGUgQXV0aG9y
aXR5MRYwFAYDVQQHEw1TYW4gRnJhbmNpc2NvMRMwEQYDVQQIEwpDYWxpZm9ybmlh
MB4XDTI2MDYxODE1MzQwMFoXDTQxMDYxNDE1MzQwMFowYjEZMBcGA1UEChMQQ2xv
dWRGbGFyZSwgSW5jLjEdMBsGA1UECxMUQ2xvdWRGbGFyZSBPcmlnaW4gQ0ExJjAk
BgNVBAMTHUNsb3VkRmxhcmUgT3JpZ2luIENlcnRpZmljYXRlMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0rVsedkw4aCJ4XF5KRjqxXiB4K+Ac/pfNE8E
O1EloHE9DUo3zT2Z67ATUgPMAThr4d53VZ+Ag4QTjQ4XNTnZyx/J4IxvBoxgiKtP
oveqgxkd51EQoSndNiP52WAVDumVpeJ9AvJ62JyT9UnriBFBQS1Lzp9QPWVzcYPi
/LipRs82UGbigmrYQewbkPCjTqjbDmVZ36IIqsdrUrsDWNvBj5tma0ya+6+9HCYF
gomkRRcKWeEuzgZhG8LyL/Wh3dC5hE43NoAPXibUJu+wXxsjMzrNOzJxiMMyI1+d
YABMYlW6yKVAe160j8irHwJeiIoSw6p6B8hna7F7zl5k03OMNQIDAQABo4IBMjCC
AS4wDgYDVR0PAQH/BAQDAgWgMB0GA1UdJQQWMBQGCCsGAQUFBwMCBggrBgEFBQcD
ATAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBRwb3uNhvANiOQH7O6hsNu0bKB7WDAf
BgNVHSMEGDAWgBQk6FNXXXw0QIep65TbuuEWePwppDBABggrBgEFBQcBAQQ0MDIw
MAYIKwYBBQUHMAGGJGh0dHA6Ly9vY3NwLmNsb3VkZmxhcmUuY29tL29yaWdpbl9j
YTAzBgNVHREELDAqghQqLmhzZ2xvYmFsZXhwb3J0LmNvbYISaHNnbG9iYWxleHBv
cnQuY29tMDgGA1UdHwQxMC8wLaAroCmGJ2h0dHA6Ly9jcmwuY2xvdWRmbGFyZS5j
b20vb3JpZ2luX2NhLmNybDANBgkqhkiG9w0BAQsFAAOCAQEAbGlSw6Qhwd6PEDhF
CiGJ4HFRGgJln5UzqhnjT3slHgAhqub7ho5Z3+SVB9IdXQaKeSgvzpmfdTWrBKW/
jfzuzdubRnAYQNecHV5maMfO18uWazfMxWhaaBAOVKMXt5NOrD6msJrZXhK4f4NB
agZX0NJEGmr5uDQrGP7RfjWaQkEJJu8K5OEgfgMTUEVOChD6n9d5uRlWgzqFD8ik
WI48iDLd2rvI9DVVwHIC7OgXm2/neJeopmPTDHXN5QHe1Hu+UfdoChheN43+c6Jk
6Bm6+sErp91pS/F2snLjUB50SGNoZf426ZXdBLPlaBe03WcU2dMUjSrqsdMtVh5P
hmiN5g==
-----END CERTIFICATE-----"""

KEY = """-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDStWx52TDhoInh
cXkpGOrFeIHgr4Bz+l80TwQ7USWgcT0NSjfNPZnrsBNSA8wBOGvh3ndVn4CDhBON
Dhc1OdnLH8ngjG8GjGCIq0+i96qDGR3nURChKd02I/nZYBUO6ZWl4n0C8nrYnJP1
SeuIEUFBLUvOn1A9ZXNxg+L8uKlGzzZQZuKCathB7BuQ8KNOqNsOZVnfogiqx2tS
uwNY28GPm2ZrTJr7r70cJgWCiaRFFwpZ4S7OBmEbwvIv9aHd0LmETjc2gA9eJtQm
77BfGyMzOs07MnGIwzIjX51gAExiVbrIpUB7XrSPyKsfAl6IihLDqnoHyGdrsXvO
XmTTc4w1AgMBAAECggEAFeNy2VWOlmGu8RRwmaxU9x6Fn2mb1nBz42Mx9VeAqSIa
TX8gPNnhW3J3D1YFozrROi16CBMBrqfRwB1um8DetxMeTY1JG00J2iixpSRFOkkp
qhXpvFQ0/qLOGZ65kUsCmLDme5/k0wuw8xIyvXfNZ4/lCBnUpAwd6fThZ49nRkuf
yWYuRQycoj/pzvluqpuSZdgM1CSZooaupgQniXcjm25XuRbpqLR66a6ljeMxy/4y
EHG+3nxdqIJVmw9Hxuvtkor5feUnhcwK3i8JaGn0g2dRjmeQeiJTck16ppGIR6fb
/dBhpQM3Ttc9Yu6r1rl900lvGIGxkCUUr/pw/Sh+IQKBgQD/GtrOsAt/kbagrCVS
4fxR2xsHmUuajDha8HFwqTuL0r2jxHmcNETsYdmdkqXVSOlfglpWogf8HnPaXkLZ
ujMGG3HPWpDBtEGBjHjQ0ViurrLS+q/2Opu8GnT2u5tAQPCxms3kB7C4vJxOtHAE
UMxk37vxbPdh3TjpBVbdn3i0ewKBgQDTcrDKTLLpbUFcQGxXywxPY6F1nTi7drAc
PXtM/BWkCwG9jxxK5sXUGxrMiskMFSWeQizsnnxIh2MEqhtcgyNl2tol8j8eUtLy
jqkgQFJdJyHP6++46Pjsr4mZjfn/c4OVJigAf4ed5BLu1dARNz1blgvstKhVNJN3
OF3T7YgbDwKBgQDpSojBLZNGVV4bL3JuioWx4dqlJ1ZRflvnJi3Hpqvy4YVVp87C
v7YsKgvVow+Orj/lfRLaWRFOShcOotclv7b7pct9ocfxrMOfEnRGGryr+s1ETcbv
OYfEDLncDZMbvoefE/+nwjSlrK6Q90fdWnqg4U5BqbHNyH5L8vsOb9D10wKBgDYJ
HTzVlPMqRIW6wPU+ooq3P0+7OgBOOHs/Cv+FfFJLrcovhF9v0iZ+Nr8GyJIZ5V8o
MirV5ZTzZE6Q2iUuLiGdaBpCafbp25a49meTiHjdwzpLZRuwDc0Onu9q5PRvJLU8
5wQZkyK6Ykw+v8lmgHujQLDhChOcOANDmFbMYPfpAoGBAPfRWPYH3jvsJQoQTX2m
n+Fp9jJdo7sT3tI3BlZrtCL1ucyAtCauRFfhXcXoPImYG93DOT0unHE9cqQ4V1Ay
Od2xVZE6I8HbsrPp017GA+OB1+sMSSBEbmxoLfsiOc43EsKSjXUA2Uh5YPXCjZv4
XEm0HoI/wBo6DtyVTEkTFohr
-----END PRIVATE KEY-----"""

NGINX_CONF = """\
# Restore real client IPs from Cloudflare
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 131.0.72.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 2400:cb00::/32;
set_real_ip_from 2606:4700::/32;
set_real_ip_from 2803:f800::/32;
set_real_ip_from 2405:b500::/32;
set_real_ip_from 2405:8100::/32;
set_real_ip_from 2a06:98c0::/29;
set_real_ip_from 2c0f:f248::/32;
real_ip_header CF-Connecting-IP;

# HTTPS — main server block
server {
    listen 443 ssl;
    server_name hsglobalexport.com www.hsglobalexport.com;

    ssl_certificate     /etc/ssl/cloudflare/hsglobalexport.com.pem;
    ssl_certificate_key /etc/ssl/cloudflare/hsglobalexport.com.key;

    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 200m;

    # Next.js static assets — long cache
    location /_next/static/ {
        proxy_pass http://localhost:3001;
        proxy_cache_bypass $http_upgrade;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Everything else -> Next.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}

# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name hsglobalexport.com www.hsglobalexport.com;
    return 301 https://$host$request_uri;
}
"""

def run(client, cmd, label):
    sys.stdout.buffer.write(f'\n>>> {label}\n'.encode('utf-8'))
    sys.stdout.buffer.flush()
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    rc  = stdout.channel.recv_exit_status()
    if out: sys.stdout.buffer.write(out.encode('utf-8')); sys.stdout.buffer.flush()
    if err: sys.stdout.buffer.write(err.encode('utf-8')); sys.stdout.buffer.flush()
    sys.stdout.buffer.write(f'[exit {rc}]\n'.encode('utf-8'))
    return rc

def put(sftp, content, remote_path, mode=0o644):
    sftp.putfo(io.BytesIO(content.encode('utf-8')), remote_path)
    sftp.chmod(remote_path, mode)
    sys.stdout.buffer.write(f'    wrote {remote_path}\n'.encode('utf-8'))
    sys.stdout.buffer.flush()

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)
sftp = client.open_sftp()

# 1. Create cert directory
run(client, 'mkdir -p /etc/ssl/cloudflare && chmod 700 /etc/ssl/cloudflare', 'create cert dir')

# 2. Upload cert and key (key is chmod 600)
put(sftp, CERT, '/etc/ssl/cloudflare/hsglobalexport.com.pem', 0o644)
put(sftp, KEY,  '/etc/ssl/cloudflare/hsglobalexport.com.key', 0o600)

# 3. Write Nginx config
NGINX_PATH   = '/etc/nginx/sites-available/hsglobalexport.com.conf'
NGINX_ENABLED = '/etc/nginx/sites-enabled/hsglobalexport.com.conf'
put(sftp, NGINX_CONF, NGINX_PATH, 0o644)
run(client, f'ln -sf {NGINX_PATH} {NGINX_ENABLED}', 'enable site')

# 4. Test + reload Nginx
run(client, 'nginx -t', 'nginx config test')
run(client, 'systemctl reload nginx', 'reload nginx')

sftp.close()
client.close()

sys.stdout.buffer.write('\n✅  SSL installed and Nginx reloaded!\n'.encode('utf-8'))
sys.stdout.buffer.write('   Now set Cloudflare SSL/TLS mode to Full (Strict)\n'.encode('utf-8'))
sys.stdout.buffer.flush()
