# Crawlers

Web scrapers for collecting Zolai language data from online sources.

**Last Updated:** 2026-04-20

## Scripts

| Script | Source | Output |
|--------|--------|--------|
| `crawl_all_news.py` | ZomiDaily, Tongsan, RVAsia | `data/corpus/news/` |
| `crawl_tongsan.py` | Tongsan news site | `data/corpus/news/` |
| `zomidaily_master.py` | ZomiDaily (master scraper) | `data/corpus/news/` |
| `fetch_tongdot_dictionary.py` | TongDot dictionary | `data/dictionary/raw/` |
| `fetch_bible_versions.py` | Online Bible sources | `data/corpus/bible/` |
| `fetch_bible_online.py` | Bible online (alternate) | `data/corpus/bible/` |
| `fetch_rvasia_tedim.py` | RVAsia Catholic readings | `data/corpus/news/` |
| `fetch_tbr17_full.py` | TBR17 Bible full text | `data/corpus/bible/` |
| `tedim_hymn_scraper.py` | Tedim hymns (510 hymns) | `data/corpus/hymns/` |

## Usage

```bash
# Crawl all news sources
python scripts/crawlers/crawl_all_news.py

# Crawl Tongsan only
python scripts/crawlers/crawl_tongsan.py

# Fetch TongDot dictionary
python scripts/crawlers/fetch_tongdot_dictionary.py --input FILE --output FILE

# Scrape Tedim hymns
python scripts/crawlers/tedim_hymn_scraper.py

# Fetch Bible versions
python scripts/crawlers/fetch_bible_versions.py
```
