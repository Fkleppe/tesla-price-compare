# Data Models & Schemas

> Freshness: 2026-01-29T11:15:00Z

## Core Types

### Product

```typescript
interface Product {
  title: string;        // Product name
  price: number;        // Current price (USD)
  currency: string;     // "USD"
  url: string;          // Product URL
  image: string;        // Image URL
  source: string;       // Store name
  sourceId: string;     // Unique ID from store
  category: string;     // Category slug
  models: string[];     // Compatible Tesla models
  description?: string; // Product description
  vendor?: string;      // Brand/vendor name
}
```

### ProductMatch

```typescript
interface ProductMatch {
  matchKey: string;     // Unique match identifier
  name?: string;        // Canonical product name
  category: string;     // Category slug
  models: string[];     // Compatible models
  brand?: string;       // Brand name
  matchType?: string;   // "exact" | "similar"
  confidence?: string;  // "high" | "medium" | "low"
  lowestPrice: number;  // Lowest price found
  highestPrice: number; // Highest price found
  savings: number;      // Price difference ($)
  savingsPercent: number; // Savings percentage
  products: Product[];  // Matched products
}
```

### FilterState

```typescript
interface FilterState {
  searchQuery: string;
  selectedModels: string[];
  selectedCategories: string[];
  selectedSources: string[];
  priceMin: number;
  priceMax: number;
  onlyDiscounted: boolean;
}
```

## Data Files

### latest.json

Array of `Product` objects scraped from all stores.

**Location**: `web/data/latest.json`
**Size**: ~5000+ products
**Updated**: Daily via scraper

### ai-matches.json

Array of `ProductMatch` objects from AI matching.

**Location**: `web/data/ai-matches.json`
**Updated**: After scraping completes

### price-history.json

Historical price data keyed by product ID.

```typescript
Record<string, {
  title: string;
  source: string;
  category: string;
  prices: Array<{
    date: string;   // ISO date
    price: number;
  }>;
}>
```

**Location**: `web/data/price-history.json`

## Enumerations

### Tesla Models

| ID | Name |
|----|------|
| `model-3` | Model 3 |
| `highland` | Model 3 Highland |
| `model-y` | Model Y |
| `juniper` | Model Y Juniper |
| `model-s` | Model S |
| `model-x` | Model X |
| `cybertruck` | Cybertruck |
| `universal` | Universal |

### Categories

| ID | Name |
|----|------|
| `floor-mats` | Floor Mats |
| `cargo-mats` | Cargo Mats |
| `screen-protector` | Screen Protectors |
| `center-console` | Center Console |
| `charging` | Charging |
| `exterior` | Exterior |
| `interior` | Interior |
| `wheel-covers` | Wheel Covers |
| `lighting` | Lighting |
| `storage` | Storage |
| `camping` | Camping |
| `sunshade` | Sunshades |
| `seat-covers` | Seat Covers |
| `electronics` | Electronics |
| `spoiler` | Spoilers |
| `phone-mount` | Phone Mounts |
| `mud-flaps` | Mud Flaps |

### Sort Options

```typescript
type SortOption =
  | 'price-asc'     // Price low to high
  | 'price-desc'    // Price high to low
  | 'name-asc'      // Name A-Z
  | 'discount-desc' // Highest discount first
  | 'newest';       // Most recently added
```

## API Response Formats

### Paginated Products

```typescript
interface PaginatedResponse<T> {
  products: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}
```

### Affiliate Partner

```typescript
interface AffiliatePartner {
  name: string;
  domains: string[];
  refParam: string;
  refValue: string;
  discountCode: string;
  discountPercent: number;
}
```

## Structured Data (JSON-LD)

Products include:
- `@type: Product`
- `aggregateRating` (seller-based)
- `review` (seller review)
- `offers` with `priceValidUntil`
- `shippingDetails`
- `hasMerchantReturnPolicy`
