import urllib.request
import urllib.error
import re
import json
import xml.etree.ElementTree as ET
import time
import concurrent.futures
import sys

SITEMAP_URL = "https://www.hsglobalexport.com/sitemap.xml"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

def get_html(url):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        response = urllib.request.urlopen(req, timeout=10)
        return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching {url}: {e}", flush=True)
        return None

def extract_seo_data(html, url):
    data = {"url": url}
    
    title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
    data['title'] = title_match.group(1).strip() if title_match else None
    
    desc_match = re.search(r'<meta[^>]+name=[\'"]description[\'"][^>]+content=[\'"](.*?)[\'"]', html, re.IGNORECASE)
    if not desc_match:
        desc_match = re.search(r'<meta[^>]+content=[\'"](.*?)[\'"][^>]+name=[\'"]description[\'"]', html, re.IGNORECASE)
    data['meta_description'] = desc_match.group(1).strip() if desc_match else None
    
    canonical_match = re.search(r'<link[^>]+rel=[\'"]canonical[\'"][^>]+href=[\'"](.*?)[\'"]', html, re.IGNORECASE)
    if not canonical_match:
        canonical_match = re.search(r'<link[^>]+href=[\'"](.*?)[\'"][^>]+rel=[\'"]canonical[\'"]', html, re.IGNORECASE)
    data['canonical'] = canonical_match.group(1).strip() if canonical_match else None
    
    og_title_match = re.search(r'<meta[^>]+property=[\'"]og:title[\'"][^>]+content=[\'"](.*?)[\'"]', html, re.IGNORECASE)
    if not og_title_match:
        og_title_match = re.search(r'<meta[^>]+content=[\'"](.*?)[\'"][^>]+property=[\'"]og:title[\'"]', html, re.IGNORECASE)
    data['og_title'] = og_title_match.group(1).strip() if og_title_match else None
    
    og_desc_match = re.search(r'<meta[^>]+property=[\'"]og:description[\'"][^>]+content=[\'"](.*?)[\'"]', html, re.IGNORECASE)
    if not og_desc_match:
        og_desc_match = re.search(r'<meta[^>]+content=[\'"](.*?)[\'"][^>]+property=[\'"]og:description[\'"]', html, re.IGNORECASE)
    data['og_description'] = og_desc_match.group(1).strip() if og_desc_match else None
    
    og_url_match = re.search(r'<meta[^>]+property=[\'"]og:url[\'"][^>]+content=[\'"](.*?)[\'"]', html, re.IGNORECASE)
    if not og_url_match:
        og_url_match = re.search(r'<meta[^>]+content=[\'"](.*?)[\'"][^>]+property=[\'"]og:url[\'"]', html, re.IGNORECASE)
    data['og_url'] = og_url_match.group(1).strip() if og_url_match else None
    
    return data

def fetch_and_parse(url):
    html = get_html(url)
    if html:
        return extract_seo_data(html, url)
    return {"url": url, "error": "failed to fetch"}

def main():
    print(f"Fetching sitemap: {SITEMAP_URL}", flush=True)
    sitemap_xml = get_html(SITEMAP_URL)
    if not sitemap_xml:
        print("Failed to fetch sitemap.", flush=True)
        return
    
    urls = re.findall(r'<loc>(.*?)</loc>', sitemap_xml)
    print(f"Found {len(urls)} URLs in sitemap.", flush=True)
    
    results = []
    
    # Fast multi-threaded fetch
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_url = {executor.submit(fetch_and_parse, url): url for url in urls}
        done_count = 0
        for future in concurrent.futures.as_completed(future_to_url):
            url = future_to_url[future]
            try:
                data = future.result()
                results.append(data)
            except Exception as exc:
                print(f'{url} generated an exception: {exc}', flush=True)
            done_count += 1
            if done_count % 10 == 0:
                print(f"Processed {done_count}/{len(urls)} URLs...", flush=True)
                
    with open('seo_audit_results_latest.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
        
    print(f"\nAudit complete. Results saved to seo_audit_results_latest.json", flush=True)

if __name__ == "__main__":
    main()
