import urllib.request
import re

req = urllib.request.Request('https://www.hsglobalexport.com/?v=1', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
match = re.search(r'<link[^>]+rel=[\'"]canonical[\'"][^>]*>', html)
if match:
    print(match.group(0))
else:
    print("No canonical found")
