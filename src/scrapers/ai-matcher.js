import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import 'dotenv/config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Group products by category and model for efficient matching
function groupProducts(products) {
  const groups = new Map();

  products.forEach(product => {
    const category = product.category || 'other';

    // Detect model from title
    const title = product.title.toLowerCase();
    let model = 'universal';
    if (title.includes('model 3') || title.includes('model3')) model = 'model-3';
    else if (title.includes('model y') || title.includes('modely')) model = 'model-y';
    else if (title.includes('model s') || title.includes('models')) model = 'model-s';
    else if (title.includes('model x') || title.includes('modelx')) model = 'model-x';
    else if (title.includes('cybertruck')) model = 'cybertruck';

    const key = `${category}|${model}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(product);
  });

  return groups;
}

// Ask Claude to match products within a group
async function matchGroupWithAI(products, category, model) {
  if (products.length < 2) return [];

  // Only process groups with products from multiple stores
  const stores = new Set(products.map(p => p.source));
  if (stores.size < 2) return [];

  // Limit to 75 products per group to control costs while getting more matches
  const limitedProducts = products.slice(0, 75);

  // Format products for Claude with full details
  const productList = limitedProducts.map((p, i) => {
    const desc = p.description ? p.description.substring(0, 150).replace(/\n/g, ' ') : '';
    const tags = p.tags ? (Array.isArray(p.tags) ? p.tags.slice(0, 5).join(', ') : p.tags) : '';
    return `${i + 1}. TITLE: "${p.title}"
   STORE: ${p.source} | PRICE: $${p.price.toFixed(2)}
   DESC: ${desc || 'N/A'}
   TAGS: ${tags || 'N/A'}`;
  }).join('\n\n');

  const prompt = `You are an EXPERT product analyst. Find ONLY truly IDENTICAL Tesla accessories.

PRODUCTS TO ANALYZE (${category} for ${model}):
${productList}

════════════════════════════════════════════════════════════════════
STEP 1: IDENTIFY PRODUCT FUNCTION (Most Important!)
════════════════════════════════════════════════════════════════════

Products have ONE primary function. These are COMPLETELY DIFFERENT categories:

PROTECTION products (protect surfaces from damage):
- "Protector", "Guard", "Shield", "Cover" (protective), "Liner" (protective)
- Function: Prevents scratches, dirt, damage to car surfaces
- Example: "Trunk Side Protector" = protects trunk walls from scratches

STORAGE products (hold/organize items):
- "Storage Box", "Storage Bin", "Organizer", "Container", "Tray" (for items)
- Function: Holds your stuff, keeps things organized
- Example: "Trunk Storage Bin" = container to put your items in

DECORATIVE/TRIM products (aesthetic upgrades):
- "Trim", "Overlay", "Wrap", "Decal", "Emblem"
- Function: Makes car look better

⚠️ CRITICAL: "Protector" ≠ "Storage" ≠ "Trim" - NEVER mix these!

════════════════════════════════════════════════════════════════════
STEP 2: CHECK PRODUCT FORM FACTOR
════════════════════════════════════════════════════════════════════

Even within same function, form factor must match:
- "Box" ≠ "Bin" ≠ "Tray" ≠ "Bag" (different shapes)
- "Mat" ≠ "Liner" ≠ "Cover" (different forms)
- "With lid" ≠ "Without lid" (different product)

════════════════════════════════════════════════════════════════════
STEP 3: CHECK SPECIFICATIONS
════════════════════════════════════════════════════════════════════

Tesla Version:
- "Highland" = 2024+ Model 3 (incompatible with 2017-2023)
- "Juniper" = 2025+ Model Y (incompatible with 2020-2024)
- Check year ranges in description!

Material: Leather ≠ TPE ≠ ABS ≠ Carbon Fiber ≠ Rubber

Quantity: "2-piece" ≠ "4-piece", "Front only" ≠ "Full set"

════════════════════════════════════════════════════════════════════
EXAMPLES OF WRONG MATCHES (NEVER DO THIS):
════════════════════════════════════════════════════════════════════

❌ "Trunk Side Protector" + "Trunk Storage Box" = WRONG
   → Protector=protection, Box=storage (different functions!)

❌ "Trunk Storage Box (Leather)" + "Trunk Storage Bins (TPE with lids)" = WRONG
   → Box≠Bins, Leather≠TPE, no lids≠with lids

❌ "Floor Mat Front" + "Floor Mat Full Set" = WRONG
   → Different quantity

❌ "Model Y 2020-2024" + "Model Y Juniper 2025+" = WRONG
   → Different car versions

════════════════════════════════════════════════════════════════════
EXAMPLES OF CORRECT MATCHES:
════════════════════════════════════════════════════════════════════

✅ "TapTes Trunk Storage Box Leather" + "Tesery Trunk Storage Box Leather" = CORRECT
   → Same function (storage), same form (box), same material (leather)

✅ "Model Y Floor Mat Full Set (Brand A)" + "Model Y Floor Mat Full Set (Brand B)" = CORRECT
   → Same function, same coverage, same car version

════════════════════════════════════════════════════════════════════

OUTPUT FORMAT (JSON only):
{
  "groups": [
    {
      "name": "Exact product description",
      "products": [1, 3],
      "matchType": "exact",
      "confidence": "high",
      "reason": "Both are X for Y, same material, same specs"
    }
  ]
}

FINAL TEST: "If customer orders product A, would they accept product B as identical?"
If ANY doubt → DO NOT MATCH. Quality over quantity.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content[0].text;

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];

    const result = JSON.parse(jsonMatch[0]);

    // Convert indices back to products
    const matches = [];
    for (const group of result.groups || []) {
      if (group.products.length < 2) continue;

      const matchedProducts = group.products
        .map(idx => limitedProducts[idx - 1])
        .filter(p => p); // Filter out invalid indices

      // Verify multiple stores
      const matchStores = new Set(matchedProducts.map(p => p.source));
      if (matchStores.size < 2) continue;

      // Calculate savings
      const prices = matchedProducts.map(p => p.price).sort((a, b) => a - b);
      const lowestPrice = prices[0];
      const highestPrice = prices[prices.length - 1];
      const savings = highestPrice - lowestPrice;
      const savingsPercent = Math.round((savings / highestPrice) * 100);

      // Determine match type
      const matchType = group.matchType || (group.confidence === 'high' ? 'exact' : 'similar');

      // Different thresholds for exact vs similar
      if (matchType === 'exact') {
        if (savings < 5 || savingsPercent < 3) continue;
      } else {
        // More lenient for similar products - just need some price difference
        if (savings < 1) continue;
      }

      matches.push({
        matchKey: group.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
        name: group.name,
        category,
        models: [model],
        matchType,
        confidence: group.confidence || 'medium',
        lowestPrice,
        highestPrice,
        savings,
        savingsPercent,
        products: matchedProducts.sort((a, b) => a.price - b.price)
      });
    }

    return matches;
  } catch (error) {
    console.error(`  Error matching ${category}/${model}:`, error.message);
    return [];
  }
}

// Main function to run AI matching
export async function runAIMatching(products) {
  console.log('\n🤖 Starting AI-powered product matching...\n');

  const groups = groupProducts(products);
  console.log(`Found ${groups.size} category/model groups to analyze\n`);

  const allMatches = [];
  let processed = 0;
  let totalTokensIn = 0;
  let totalTokensOut = 0;

  // Process groups with multiple stores
  const relevantGroups = [...groups.entries()]
    .filter(([key, prods]) => {
      const stores = new Set(prods.map(p => p.source));
      return stores.size >= 2 && prods.length >= 2;
    })
    .sort((a, b) => b[1].length - a[1].length); // Largest groups first

  console.log(`Processing ${relevantGroups.length} groups with products from multiple stores...\n`);

  for (const [key, groupProducts] of relevantGroups) {
    const [category, model] = key.split('|');
    const stores = new Set(groupProducts.map(p => p.source));

    process.stdout.write(`  ${category} (${model}): ${groupProducts.length} products, ${stores.size} stores... `);

    const matches = await matchGroupWithAI(groupProducts, category, model);

    if (matches.length > 0) {
      console.log(`✓ ${matches.length} matches found`);
      allMatches.push(...matches);
    } else {
      console.log('no matches');
    }

    processed++;

    // Rate limiting - wait between requests
    if (processed < relevantGroups.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Sort by savings
  allMatches.sort((a, b) => b.savings - a.savings);

  const exactMatches = allMatches.filter(m => m.matchType === 'exact').length;
  const similarMatches = allMatches.filter(m => m.matchType === 'similar').length;

  console.log(`\n✓ AI matching complete:`);
  console.log(`  - ${exactMatches} exact matches (same product)`);
  console.log(`  - ${similarMatches} similar matches (comparable products)`);
  console.log(`  - ${allMatches.length} total matches`);

  return allMatches;
}

// Standalone execution
async function main() {
  try {
    // Load products
    const productsData = await fs.readFile('./data/latest.json', 'utf-8');
    const products = JSON.parse(productsData);

    console.log(`Loaded ${products.length} products`);

    // Run AI matching
    const matches = await runAIMatching(products);

    // Save matches
    await fs.writeFile(
      './data/ai-matches.json',
      JSON.stringify(matches, null, 2)
    );

    console.log(`\nSaved ${matches.length} matches to data/ai-matches.json`);

    // Print top deals
    console.log('\n💰 TOP AI-MATCHED DEALS:\n');
    matches.slice(0, 10).forEach((match, i) => {
      console.log(`${i + 1}. Save $${match.savings.toFixed(0)} (${match.savingsPercent}% off) - ${match.confidence} confidence`);
      console.log(`   "${match.name}"`);
      match.products.forEach((p, j) => {
        const tag = j === 0 ? ' ✓ BEST' : '';
        console.log(`   $${p.price.toFixed(2)} at ${p.source}${tag}`);
      });
      console.log('');
    });

    // Estimate cost
    const inputTokens = matches.length * 500; // Rough estimate
    const outputTokens = matches.length * 200;
    const cost = (inputTokens * 0.25 + outputTokens * 1.25) / 1000000;
    console.log(`Estimated API cost: ~$${cost.toFixed(3)}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run if called directly
main();
