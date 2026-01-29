# Architecture Overview

> Freshness: 2026-01-29T11:15:00Z

## System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVPriceHunt Architecture                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────┐  │
│  │   Scrapers  │────▶│  JSON Data  │────▶│  Next.js Web    │  │
│  │   (Python/  │     │  (latest.   │     │  (Vercel)       │  │
│  │   Node.js)  │     │   json)     │     │                 │  │
│  └─────────────┘     └─────────────┘     └─────────────────┘  │
│        │                   │                     │             │
│        │                   │                     │             │
│        ▼                   ▼                     ▼             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────┐  │
│  │ AI Matcher  │────▶│ ai-matches. │     │  API Routes     │  │
│  │ (Claude)    │     │   json      │     │  /api/products  │  │
│  └─────────────┘     └─────────────┘     │  /api/matches   │  │
│                                          │  /api/history   │  │
│                                          └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js (App Router) | 16.1.6 |
| React | React 19 | 19.2.3 |
| Styling | Tailwind CSS | 4.x |
| Data Fetching | SWR | 2.3.8 |
| Scraping | Puppeteer + crawl4ai | - |
| AI Matching | Claude API | - |
| Hosting | Vercel | - |

## Data Flow

1. **Scraping** (scheduled via launchd)
   - `crawl4ai-scraper.py` → Shopify/generic stores
   - `multi-site-scraper.js` → Custom scrapers
   - Output: `web/data/latest.json`

2. **AI Matching**
   - `ai-matcher.js` → Groups similar products
   - Output: `web/data/ai-matches.json`

3. **Frontend**
   - Static generation (ISR) for product pages
   - Client-side filtering with SWR
   - API routes for pagination

## Key Directories

```
tesla-price-compare/
├── src/                    # Scraper source
│   ├── scrapers/           # Individual scrapers
│   └── storage.js          # Data persistence
├── web/                    # Next.js application
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities & types
│   └── data/               # JSON data files
├── data/                   # Backup data
└── codemaps/               # This documentation
```

## Deployment

- **Frontend**: Vercel (auto-deploy from GitHub)
- **Scraper**: Local launchd scheduled task
- **Domain**: evpricehunt.com
