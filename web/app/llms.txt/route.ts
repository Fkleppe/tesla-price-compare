import { SITE_URL, SITE_NAME, CATEGORIES, TESLA_MODELS, TOP_10_LISTS } from '@/lib/constants';

export async function GET() {
  const content = `# ${SITE_NAME}

> ${SITE_NAME} is a price comparison website for Tesla and EV accessories. We help Tesla owners find the best deals across multiple stores with exclusive discount codes.

## What We Do
- Compare prices on Tesla accessories from verified retailers
- Provide exclusive discount codes (5-20% off)
- Cover all Tesla models: Model 3, Model Y, Model S, Model X, and Cybertruck
- Track price history and alert users to deals

## Key Pages

### Homepage
${SITE_URL}
Browse and compare 2700+ Tesla accessories. Filter by model, category, price, and store.

### Top 10 Lists (Curated Rankings)
${TOP_10_LISTS.map(list => `- ${SITE_URL}/top-10/${list.id} - ${list.title}`).join('\n')}

### Categories
${CATEGORIES.map(cat => `- ${SITE_URL}/category/${cat.id} - ${cat.name}: ${cat.description}`).join('\n')}

### Tesla Models
${TESLA_MODELS.filter(m => m.id !== 'universal').map(model => `- ${SITE_URL}/model/${model.id} - Accessories for ${model.name}`).join('\n')}

### Stores
${SITE_URL}/stores - List of verified Tesla accessory retailers we compare

## Discount Codes Available
- Tesery: Code "123" for 5% off
- Jowua: Code "AWD" for 5% off
- Shop4Tesla: Code "10" for 10% off
- Snuuzu: Code "KLEPPE" for 10% off
- Havnby: Code "AWD" for 10% off
- Tesloid: Code "AWD" for 5% off

## Popular Product Categories
1. Floor Mats - All-weather TPE protection
2. Screen Protectors - 9H tempered glass
3. Charging - Home and portable chargers
4. Sunshades - UV protection
5. Center Console - Wraps and organizers
6. Cargo Mats - Trunk protection
7. Wheel Covers - Aero and style options

## How to Use
1. Visit ${SITE_URL}
2. Filter by your Tesla model (Model 3, Model Y, etc.)
3. Browse categories or search for specific accessories
4. Compare prices across stores
5. Use discount codes at checkout for additional savings

## Contact
Website: ${SITE_URL}

## Technical Details
- Updated: January 2026
- Products indexed: 2700+
- Stores compared: 5+
- Price updates: Daily
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
}
