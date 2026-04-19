# Skill: Zolai Web Crawler

## Trigger
- "crawl zolai"
- "scrape websites"
- "fetch web data"

## Description
Crawls Zolai websites for language data.

## Prerequisites
```bash
pip install beautifulsoup4 lxml duckduckgo-search
```

## Workflow

### Step 1: Identify Sources
Common Zolai sources:
- church websites (.org)
- educational sites
- news sites
- dictionary sites

### Step 2: Crawl Website
```python
from bs4 import BeautifulSoup
import requests

def crawl(url):
    r = requests.get(url)
    soup = BeautifulSoup(r.text, "lxml")
    
    # Extract text
    for p in soup.find_all("p"):
        text = p.get_text(strip=True)
        if len(text) > 10:
            yield {"text": text, "source": url}
```

### Step 3: DuckDuckGo Search
```python
from duckduckgo_search import DDGS

def search(query, max_results=10):
    ddgs = DDGS()
    results = ddgs.text(query, max_results=max_results)
    return [r["url"] for r in results]
```

### Step 4: Save
```bash
python pipelines/collect.py -i scraped.jsonl -t web -o raw/web/
```

## Tools
| Tool | Purpose | Install |
|------|---------|---------|
| requests | HTTP requests | `pip install requests` |
| beautifulsoup4 | HTML parsing | `pip install beautifulsoup4` |
| lxml | Fast parsing | `pip install lxml` |
| playwright | JS rendering | `pip install playwright` |
| scrapy | Industrial crawl | `pip install scrapy` |

## Rate Limiting
- Be respectful: 1 request/second
- Add delays between requests
- Use headers: User-Agent
- Check robots.txt

## Output
Save to `raw/web/`

## Related Skills
- data-cleaner - Clean scraped data
- data-deduplicator - Remove duplicates
- data-labeler - Label source