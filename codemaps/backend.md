# Backend Architecture (Scraper)

> Freshness: 2026-01-29T11:15:00Z

## Overview

The backend consists of web scrapers that collect Tesla accessory prices from multiple stores and an AI matcher that groups similar products.

## Technology Stack

- **Runtime**: Node.js (ES Modules) + Python 3.9
- **Scraping**: Puppeteer, puppeteer-extra-stealth, crawl4ai
- **AI**: Claude API (@anthropic-ai/sdk)
- **Parsing**: Cheerio, Axios
- **Scheduling**: macOS launchd

## Directory Structure

```
src/
├── index.js              # Main entry point
├── storage.js            # Data persistence utilities
└── scrapers/
    ├── base.js           # Base scraper class
    ├── sites-config.js   # Store configurations
    ├── multi-site-scraper.js
    ├── simple-scraper.js
    ├── shopify-api-scraper.js
    ├── crawl4ai-scraper.py
    ├── ai-matcher.js     # Claude-powered matching
    ├── product-matcher.js
    ├── abstractocean.js  # Custom scrapers
    ├── tesmanian.js
    ├── run-scraper.sh    # Execution script
    └── setup.sh          # Environment setup
```

## Scraper Types

### 1. Shopify API Scraper
- Uses Shopify's `/products.json` endpoint
- Handles pagination (250 products/page)
- Extracts variants and pricing

### 2. crawl4ai Scraper (Python)
- Uses headless browser via crawl4ai
- Handles JavaScript-heavy sites
- Extracts structured product data

### 3. Custom Scrapers
- `abstractocean.js` - Abstract Ocean store
- `tesmanian.js` - Tesmanian store
- Site-specific parsing logic

## Sites Configuration

`sites-config.js` defines:
- Store URLs and selectors
- Category mapping rules
- Model detection patterns
- Price extraction logic

## AI Matcher

`ai-matcher.js` uses Claude to:
1. Group identical products across stores
2. Extract brand/model information
3. Calculate price differentials
4. Generate match confidence scores

Output: `web/data/ai-matches.json`

## Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Scrape      │────▶│  Normalize   │────▶│  Store       │
│  Products    │     │  Data        │     │  JSON        │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  AI Match    │
                     │  Products    │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Copy to     │
                     │  web/data/   │
                     └──────────────┘
```

## Scheduling

`com.evpricehunt.scraper.plist` - launchd job:
- Runs daily scrape
- Outputs to `data/` directory
- Copies results to `web/data/`

## Storage Module

`storage.js` provides:
- `loadProducts()` - Read existing data
- `saveProducts()` - Write product array
- `mergeProducts()` - Update with new data
- `generateId()` - Create unique product IDs
