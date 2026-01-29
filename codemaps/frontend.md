# Frontend Architecture

> Freshness: 2026-01-29T11:15:00Z

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.3
- **Styling**: Tailwind CSS 4.x + styled-jsx
- **Data**: SWR for client-side fetching
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics

## Directory Structure

```
web/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (metadata, fonts)
│   ├── page.tsx                  # Homepage (SSR)
│   ├── globals.css               # Global styles
│   ├── favicon.ico               # Favicon files
│   ├── icon.{png,svg}
│   ├── apple-icon.png
│   ├── sitemap.ts                # Dynamic sitemap
│   ├── robots.ts                 # Robots.txt
│   ├── opengraph-image.tsx       # OG image generation
│   │
│   ├── api/                      # API Routes
│   │   ├── products/route.ts     # Paginated products
│   │   ├── matches/route.ts      # AI matches
│   │   ├── history/route.ts      # Price history
│   │   └── ai-context/route.ts   # LLM context
│   │
│   ├── product/[slug]/           # Product detail pages
│   ├── model/[slug]/             # Model-specific listings
│   ├── model/[slug]/[category]/  # Model + category combo
│   ├── category/[slug]/          # Category listings
│   ├── compare/[slug]/           # Price comparisons
│   ├── top-10/[slug]/            # Top 10 lists
│   ├── about/                    # Static pages
│   ├── privacy/
│   └── stores/
│
├── components/                   # Shared components
│   ├── HomeClient.tsx            # Main client component
│   ├── ProductCard.tsx           # Product display card
│   ├── ProductGridSSR.tsx        # Server-rendered grid
│   ├── HeroSection.tsx           # Homepage hero
│   ├── Header.tsx                # Navigation
│   ├── Footer.tsx                # Site footer
│   ├── Breadcrumbs.tsx           # Navigation breadcrumbs
│   ├── JsonLd.tsx                # Structured data
│   └── ProductSkeleton.tsx       # Loading skeleton
│
├── lib/                          # Utilities
│   ├── types.ts                  # TypeScript interfaces
│   ├── constants.ts              # App constants
│   ├── affiliate.ts              # Affiliate link handling
│   ├── data.ts                   # Server-side data utils
│   ├── cache.ts                  # In-memory cache
│   └── hooks/
│       └── useProducts.ts        # SWR hook with debounce
│
└── data/                         # JSON data
    ├── latest.json               # All products
    ├── ai-matches.json           # Product matches
    └── price-history.json        # Historical prices
```

## Key Components

### HomeClient.tsx
Main client component handling:
- Product filtering (model, category, source, price)
- Search with debounce
- Sort options
- Match modal display
- Mobile filter sidebar

### ProductCard.tsx
Displays individual product with:
- Image with next/image optimization
- Price with discount badge
- Affiliate link handling
- Model badges

### JsonLd.tsx
Structured data for SEO:
- ProductJsonLd (with aggregateRating, review)
- OrganizationJsonLd
- WebSiteJsonLd
- ItemListJsonLd
- FAQJsonLd

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/products` | GET | Paginated products with filters |
| `/api/matches` | GET | AI product matches |
| `/api/history` | GET | Price history data |
| `/api/ai-context` | GET | LLM-friendly context |

## SEO Features

- Dynamic `generateMetadata()` per page
- JSON-LD structured data
- Dynamic sitemap with 4145+ pages
- OG images generated per page
- Canonical URLs
- robots.txt configuration

## State Management

- **Server**: React Server Components for initial data
- **Client**: SWR with keepPreviousData
- **URL**: Search params for shareable filters
- **Local**: useState for UI state (modals, mobile menu)
