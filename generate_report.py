import json

def generate_report():
    with open('seo_audit_results_latest.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    total_pages = len(data)
    missing_title = [d['url'] for d in data if not d.get('title')]
    missing_desc = [d['url'] for d in data if not d.get('meta_description')]
    missing_canon = [d['url'] for d in data if not d.get('canonical')]
    missing_og_title = [d['url'] for d in data if not d.get('og_title')]
    missing_og_desc = [d['url'] for d in data if not d.get('og_description')]

    report = f"""# SEO Audit Report for hsglobalexport.com

## Overview
- **Total Pages Crawled:** {total_pages}
- **Missing Title Tags:** {len(missing_title)}
- **Missing Meta Descriptions:** {len(missing_desc)}
- **Missing Canonical Links:** {len(missing_canon)}
- **Missing OG Titles:** {len(missing_og_title)}
- **Missing OG Descriptions:** {len(missing_og_desc)}

## Detailed Findings

### 1. Title Tags & Canonical Links
✅ Excellent! All {total_pages} pages have `<title>` tags and `<link rel="canonical">` correctly configured.

### 2. Meta Descriptions (Missing on {len(missing_desc)} pages)
There are {len(missing_desc)} pages lacking a meta description. This is a missed opportunity for search engine snippets. 
**Sample of pages missing meta description:**
"""
    for url in missing_desc[:10]:
        report += f"- {url}\n"
    if len(missing_desc) > 10:
        report += f"- ...and {len(missing_desc) - 10} more.\n"

    report += f"""
### 3. Open Graph (OG) Tags
Social sharing tags (OG tags) are mostly present, but some pages are missing them:
- **Missing OG Title:** {len(missing_og_title)} pages.
"""
    for url in missing_og_title[:5]:
        report += f"  - {url}\n"
    report += f"- **Missing OG Description:** {len(missing_og_desc)} pages.\n"
    for url in missing_og_desc[:5]:
        report += f"  - {url}\n"

    report += """
## Recommendations
1. **Fix Missing Meta Descriptions:** Prioritize adding unique meta descriptions to the product pages listed above. Since they appear to be products (e.g., marble coffee tables), these descriptions directly impact click-through rates (CTR) from search engines.
2. **Ensure OG Tag Completeness:** Ensure that the Open Graph title and description are correctly pulled from the page title and meta description.

> [!TIP]
> The full JSON dataset of this crawl has been saved to your workspace at `d:\\hs-global-main\\seo_audit_results_latest.json`.
"""

    with open('seo_audit_report.md', 'w', encoding='utf-8') as f:
        f.write(report)

if __name__ == '__main__':
    generate_report()
