# Data Sources & Policy

This file documents **where data comes from**, **licensing constraints**, and **how we collect it**.
It exists to prevent accidental scraping of restricted content and to keep the project legally and ethically safe.

## Rules (always)

- **Respect ToS**: do not scrape sites that disallow it.
- **Prefer public-domain / permissive sources** when possible.
- **Store only pointers in git**: large corpora are published to Hugging Face / Kaggle; git keeps manifests and scripts.
- **Redact private info**: no phone numbers, emails, addresses, private chats.
- **Consent-first for community data**: for closed groups, request permission and provide opt-out.

## Approved sources (current)

| Source | Type | Collection | Notes |
|---|---|---|---|
| ZomiDaily | news text | `scripts/crawlers/crawl_all_news.py` | public news |
| Tongsan | news text | `scripts/crawlers/crawl_tongsan.py` | public news |
| RVAsia Tedim | readings | `scripts/crawlers/fetch_rvasia_tedim.py` | verify rights before redistributing |
| TongDot dictionary | dictionary | `scripts/crawlers/fetch_tongdot_dictionary.py` | check usage rights; keep attribution |
| Bible (TB77, TBR17, Tedim2010, KJV) | parallel corpus | `scripts/bible/*` | KJV public domain; others vary |
| Tedim hymnals (public scans) | OCR | `zolai/ocr/mistral_ocr.py` | only if redistribution allowed |

## Conditionally approved sources (require checks)

| Source | Type | Collection | Required |
|---|---|---|---|
| YouTube sermons / radio | audio → transcript | `scripts/crawlers/audio_to_text.py` | cite URL + channel; avoid private videos |
| Telegram public channels | messages | `scripts/crawlers/telegram_export.py` | public-only; remove personal data |
| Facebook public pages | posts | manual export then cleaner | do not scrape private groups |

## Attribution standard (required fields)

Every exported record should include:

- `source`: short id (`zomidaily`, `tongsan`, `youtube`, `telegram`, `bible`, `dictionary`)
- `url` or `sourceRef`
- `collectedAt` (ISO)
- `license` (if known)

## Takedown

If any content owner requests removal, we remove it from downstream datasets and note the takedown in `docs/guides/CHANGELOG.md`.

