import urllib.request
import urllib.parse
from html.parser import HTMLParser
import ssl
import json
from concurrent.futures import ThreadPoolExecutor

class SEOHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.meta_description = ""
        self.og_tags = {}
        self.canonical = ""
        self.h1s = []
        self.in_title = False
        self.in_h1 = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "title":
            self.in_title = True
        elif tag == "meta":
            name = attrs_dict.get("name", "").lower()
            prop = attrs_dict.get("property", "").lower()
            content = attrs_dict.get("content", "")
            
            if name == "description":
                self.meta_description = content
            elif prop.startswith("og:"):
                self.og_tags[prop] = content
        elif tag == "link":
            rel = attrs_dict.get("rel", "").lower()
            if rel == "canonical":
                self.canonical = attrs_dict.get("href", "")
        elif tag == "h1":
            self.in_h1 = True

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.in_h1:
            self.h1s.append(data.strip())

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == "h1":
            self.in_h1 = False

class LinkParser(HTMLParser):
    def __init__(self, base_url):
        super().__init__()
        self.links = set()
        self.base_url = base_url
        self.base_domain = urllib.parse.urlparse(base_url).netloc

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            attrs_dict = dict(attrs)
            href = attrs_dict.get("href", "")
            if href:
                full_url = urllib.parse.urljoin(self.base_url, href)
                parsed = urllib.parse.urlparse(full_url)
                # Only keep http/https links to the same domain
                if parsed.scheme in ("http", "https") and parsed.netloc == self.base_domain:
                    # Remove fragment
                    clean_url = urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, parsed.query, ''))
                    self.links.add(clean_url)

def fetch_url(url):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            if response.headers.get_content_type() != 'text/html':
                return None
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def analyze_page(url):
    html = fetch_url(url)
    if not html:
        return None
        
    parser = SEOHTMLParser()
    parser.feed(html)
    
    return {
        "url": url,
        "title": parser.title.strip(),
        "meta_description": parser.meta_description,
        "og_tags": parser.og_tags,
        "canonical": parser.canonical,
        "h1": [h for h in parser.h1s if h],
    }

def crawl_site(start_url, max_pages=20):
    visited = set()
    to_visit = [start_url]
    results = []
    
    while to_visit and len(visited) < max_pages:
        url = to_visit.pop(0)
        if url in visited:
            continue
            
        visited.add(url)
        print(f"Crawling: {url}")
        
        html = fetch_url(url)
        if not html:
            continue
            
        # Parse links
        link_parser = LinkParser(start_url)
        link_parser.feed(html)
        
        for link in link_parser.links:
            if link not in visited and link not in to_visit:
                to_visit.append(link)
                
        # Parse SEO
        seo_parser = SEOHTMLParser()
        seo_parser.feed(html)
        
        results.append({
            "url": url,
            "title": seo_parser.title.strip(),
            "meta_description": seo_parser.meta_description,
            "og_tags": seo_parser.og_tags,
            "canonical": seo_parser.canonical,
            "h1": [h for h in seo_parser.h1s if h],
        })
        
    return results

if __name__ == "__main__":
    start_url = "https://www.hsglobalexport.com/"
    print(f"Starting crawl for {start_url}...")
    results = crawl_site(start_url, max_pages=30)
    
    with open("seo_audit_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Audit completed. Found {len(results)} pages.")
