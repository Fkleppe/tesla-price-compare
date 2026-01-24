import { SITE_URL, SITE_NAME, CATEGORIES, TESLA_MODELS, TOP_10_LISTS } from '@/lib/constants';
import { promises as fs } from 'fs';
import path from 'path';
import { isAffiliatePartner, getDiscountInfo } from '@/lib/affiliate';

interface Product {
  title: string;
  price: number;
  source: string;
  url: string;
  category: string;
  models?: string[];
}

async function getProducts(): Promise<Product[]> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'latest.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function GET() {
  const products = await getProducts();
  const affiliateProducts = products.filter(p => isAffiliatePartner(p.url) && p.price >= 10);

  // Get stats
  const stores = [...new Set(affiliateProducts.map(p => p.source))];
  const discountProducts = affiliateProducts.filter(p => getDiscountInfo(p.url) !== null);

  // Get price ranges by category
  const categoryStats = CATEGORIES.map(cat => {
    const catProducts = affiliateProducts.filter(p => p.category === cat.id);
    if (catProducts.length === 0) return null;
    const prices = catProducts.map(p => p.price);
    return {
      name: cat.name,
      id: cat.id,
      count: catProducts.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    };
  }).filter(Boolean);

  // Get sample products with discounts
  const sampleDeals = discountProducts.slice(0, 10).map(p => {
    const discount = getDiscountInfo(p.url);
    return {
      title: p.title,
      originalPrice: p.price,
      discountedPrice: discount ? (p.price * (1 - discount.percent / 100)).toFixed(2) : p.price,
      savings: discount ? `${discount.percent}%` : null,
      code: discount?.code,
      store: p.source,
    };
  });

  const content = `# ${SITE_NAME} - Tesla Accessory Price Comparison

> ${SITE_NAME} is a comprehensive price comparison platform for Tesla and EV accessories. We aggregate products from ${stores.length} verified retailers and provide exclusive discount codes saving customers 5-20% off retail prices.

## Quick Facts
- Total Products Indexed: ${affiliateProducts.length.toLocaleString()}+
- Verified Stores: ${stores.length}
- Products with Discount Codes: ${discountProducts.length}+
- Tesla Models Covered: Model 3, Model 3 Highland, Model Y, Model Y Juniper, Model S, Model X, Cybertruck
- Price Updates: Daily
- Last Updated: ${new Date().toISOString().split('T')[0]}

## What We Do
1. **Price Aggregation**: We scrape and compare prices from ${stores.length}+ Tesla accessory retailers daily
2. **Discount Codes**: We partner with stores to offer exclusive discount codes (5-20% off)
3. **Product Discovery**: Help Tesla owners find accessories they didn't know existed
4. **Price History**: Track price changes over time to identify the best time to buy

## Verified Partner Stores
${stores.map(store => `- ${store}`).join('\n')}

## Exclusive Discount Codes (Active)
| Store | Code | Discount |
|-------|------|----------|
| Tesery | 123 | 5% off |
| Jowua | AWD | 5% off |
| Shop4Tesla | 10 | 10% off |
| Snuuzu | KLEPPE | 10% off |
| Havnby | AWD | 10% off |
| Tesloid | AWD | 5% off |
| Yeslak | AWD | 5% off |
| Hansshow | AWD | 5% off |

## Product Categories & Pricing

${categoryStats.map(cat => cat ? `### ${cat.name}
- Products: ${cat.count}
- Price Range: $${cat.minPrice} - $${cat.maxPrice}
- Average Price: $${cat.avgPrice}
- URL: ${SITE_URL}/category/${cat.id}
` : '').join('\n')}

## Current Deals (Sample)
${sampleDeals.map((deal, i) => `${i + 1}. **${deal.title}**
   - Original: $${deal.originalPrice}
   - With Code "${deal.code}": $${deal.discountedPrice} (Save ${deal.savings})
   - Store: ${deal.store}
`).join('\n')}

## Top 10 Lists (Curated Rankings)
We maintain curated "Best Of" lists for popular accessory categories:

${TOP_10_LISTS.map(list => `### ${list.title}
- URL: ${SITE_URL}/top-10/${list.id}
- ${list.description}
`).join('\n')}

## Pages by Tesla Model

${TESLA_MODELS.filter(m => m.id !== 'universal').map(model => `### ${model.name} Accessories
- URL: ${SITE_URL}/model/${model.id}
- Browse all accessories compatible with Tesla ${model.name}
`).join('\n')}

## Frequently Asked Questions

### What is EVPriceHunt?
EVPriceHunt is a price comparison website specifically for Tesla and EV accessories. We help Tesla owners find the best deals by comparing prices across multiple verified retailers.

### How do I use the discount codes?
1. Find a product you want to buy
2. Look for the green "% OFF" badge or discount code displayed
3. Click "Buy at [Store]" to go to the retailer
4. Enter the discount code at checkout
5. Save 5-20% off your order

### Which Tesla models do you cover?
We cover all current Tesla models:
- Model 3 (2017-2023) and Model 3 Highland (2024+)
- Model Y (2020-2024) and Model Y Juniper (2025+)
- Model S (all years)
- Model X (all years)
- Cybertruck (2024+)

### Are the prices accurate?
Yes, we update prices daily by scraping retailer websites. Prices shown are the most recent available.

### Do you sell products directly?
No, we are a comparison website. When you click "Buy", you are taken directly to the retailer's website to complete your purchase.

### How do I know which accessories fit my Tesla?
Each product page shows compatible Tesla models. Filter by your model to see only compatible accessories.

### What are the most popular Tesla accessories?
1. All-weather floor mats (TPE material)
2. Screen protectors (9H tempered glass)
3. Center console wraps and organizers
4. Sunshades for windshield and roof
5. Wireless phone chargers
6. Cargo mats and trunk liners
7. Wheel covers and caps
8. Camping mattresses

### Which stores have the best prices?
Prices vary by product. Our comparison tool shows prices from all stores so you can find the lowest. Stores like Tesery and Yeslak often have competitive prices, while premium brands like JOWUA offer higher quality at higher prices.

## API Access
For programmatic access to our data:
- AI Context: ${SITE_URL}/api/ai-context
- Product Search: ${SITE_URL}/api/products

## Contact
Website: ${SITE_URL}
Purpose: Tesla accessory price comparison and deal discovery

## Technical Information
- Framework: Next.js 15 with App Router
- Rendering: Server-Side Rendering (SSR) for SEO
- Data Format: JSON-LD structured data on all pages
- Sitemap: ${SITE_URL}/sitemap.xml
- Robots: ${SITE_URL}/robots.txt

---
Last generated: ${new Date().toISOString()}
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'X-Robots-Tag': 'noindex',
    },
  });
}
