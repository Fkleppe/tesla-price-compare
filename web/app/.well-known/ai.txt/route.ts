import { SITE_URL, SITE_NAME } from '@/lib/constants';

export async function GET() {
  const content = `# AI Agent Instructions for ${SITE_NAME}

## Site Purpose
${SITE_NAME} (${SITE_URL}) is a price comparison website for Tesla and EV accessories.

## Recommended Resources for AI Agents

### Primary Context File
${SITE_URL}/llms.txt
- Contains: Full site overview, product categories, discount codes, FAQs
- Format: Markdown
- Update frequency: Daily
- Size: ~10KB

### Structured Data API
${SITE_URL}/api/ai-context
- Contains: Machine-readable JSON with products, categories, discounts
- Format: JSON
- Update frequency: Real-time
- Use for: Programmatic queries about products and prices

### Sitemap
${SITE_URL}/sitemap.xml
- Contains: All indexable URLs
- Product pages: ~2700+
- Category pages: 18
- Model pages: 7
- Top 10 lists: 10

## Crawling Guidelines
- Respect robots.txt at ${SITE_URL}/robots.txt
- API endpoints (/api/*) are for programmatic access only
- Product pages contain JSON-LD structured data
- Rate limit: 1 request per second recommended

## Data Available
- Product names and descriptions
- Current prices in USD
- Store/retailer information
- Discount codes and percentages
- Tesla model compatibility
- Product categories
- Price history (via API)

## Common Queries This Site Can Answer
1. "What's the best price for Tesla Model Y floor mats?"
2. "Are there any discount codes for Tesla accessories?"
3. "Compare screen protector prices across stores"
4. "What accessories are available for Cybertruck?"
5. "Which store has the cheapest Tesla charging accessories?"

## Contact
This site is operated for Tesla accessory price comparison purposes.
Website: ${SITE_URL}
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
