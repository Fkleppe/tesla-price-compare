import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import 'dotenv/config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

// Maximum price ratio allowed between products (2.5x = max 60% savings)
const MAX_PRICE_RATIO = 2.5;

// Minimum title similarity required (0-1 scale, 0.35 = 35% similar words)
const MIN_TITLE_SIMILARITY = 0.35;

// Words to ignore when comparing titles (common filler words)
const STOP_WORDS = new Set([
  'for', 'the', 'and', 'with', 'set', 'of', 'to', 'in', 'on', 'a', 'an',
  'tesla', 'model', '3', 'y', 's', 'x', 'cybertruck', '2017', '2018', '2019',
  '2020', '2021', '2022', '2023', '2024', '2025', '2026', 'new', 'premium',
  'upgraded', 'version', 'style', 'type', 'pcs', 'piece', 'pieces'
]);

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if prices are compatible (not too different)
 * Products with wildly different prices are likely NOT the same product
 */
function pricesAreCompatible(price1, price2) {
  const ratio = Math.max(price1, price2) / Math.min(price1, price2);
  return ratio <= MAX_PRICE_RATIO;
}

/**
 * Extract meaningful words from a product title
 */
function extractKeywords(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Calculate similarity between two titles based on shared keywords
 * Returns a value between 0 and 1
 */
function calculateTitleSimilarity(title1, title2) {
  const words1 = new Set(extractKeywords(title1));
  const words2 = new Set(extractKeywords(title2));

  if (words1.size === 0 || words2.size === 0) return 0;

  // Count shared words
  let shared = 0;
  for (const word of words1) {
    if (words2.has(word)) shared++;
  }

  // Jaccard similarity: intersection / union
  const union = new Set([...words1, ...words2]).size;
  return shared / union;
}

/**
 * Check if two products are fundamentally different based on key distinguishing words
 */
function areProductsFundamentallyDifferent(title1, title2) {
  const t1 = title1.toLowerCase();
  const t2 = title2.toLowerCase();

  // Mutually exclusive product types - if one has it and other doesn't, they're different
  const exclusiveTypes = [
    ['cleaning', 'brush'],      // Cleaning tools
    ['mount', 'holder'],        // Phone mounts
    ['charger', 'charging'],    // Chargers
    ['mat', 'liner'],           // Floor mats
    ['spoiler', 'lip'],         // Body kit
    ['refrigerator', 'freezer', 'cooler bag'], // Cooling
    ['electric', 'power', 'automatic'], // Motorized
    ['stalk', 'shift'],         // Controls
  ];

  for (const typeWords of exclusiveTypes) {
    const t1HasType = typeWords.some(w => t1.includes(w));
    const t2HasType = typeWords.some(w => t2.includes(w));

    // Check for specific conflicts
    if (t1.includes('cleaning') && t2.includes('mount')) return true;
    if (t1.includes('mount') && t2.includes('cleaning')) return true;
    if (t1.includes('brush') && t2.includes('mount')) return true;
    if (t1.includes('mount') && t2.includes('brush')) return true;
    if (t1.includes('mat') && t2.includes('frunk') && t2.includes('electric')) return true;
    if (t2.includes('mat') && t1.includes('frunk') && t1.includes('electric')) return true;
    if (t1.includes('cover') && t2.includes('stalk') && !t1.includes('stalk')) return true;
    if (t2.includes('cover') && t1.includes('stalk') && !t2.includes('stalk')) return true;
  }

  return false;
}

/**
 * Validate a group of matched products
 * Returns only products that pass all validation checks
 */
function validateMatchGroup(products) {
  if (products.length < 2) return [];

  // Check all pairs for compatibility
  const validProducts = [];
  const baseProduct = products[0];
  validProducts.push(baseProduct);

  for (let i = 1; i < products.length; i++) {
    const product = products[i];

    // Check price compatibility with base product
    if (!pricesAreCompatible(baseProduct.price, product.price)) {
      continue;
    }

    // Check title similarity
    const similarity = calculateTitleSimilarity(baseProduct.title, product.title);
    if (similarity < MIN_TITLE_SIMILARITY) {
      continue;
    }

    // Check for fundamental differences
    if (areProductsFundamentallyDifferent(baseProduct.title, product.title)) {
      continue;
    }

    validProducts.push(product);
  }

  // Must have at least 2 products from different stores
  const stores = new Set(validProducts.map(p => p.source));
  if (stores.size < 2) return [];

  return validProducts;
}

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
⚠️ CRITICAL RULE: PRICE SANITY CHECK
════════════════════════════════════════════════════════════════════

Products with WILDLY DIFFERENT PRICES are NOT the same product!

- Max 2.5x price difference allowed (e.g., $40 vs $100 is OK, $4 vs $65 is NOT)
- A $3.99 cleaning brush is NOT the same as a $64.95 phone mount
- A $43 floor mat is NOT the same as a $459 electric frunk system
- If prices differ by more than 2.5x, they are DIFFERENT products!

════════════════════════════════════════════════════════════════════
STEP 1: IDENTIFY PRODUCT FUNCTION (Most Important!)
════════════════════════════════════════════════════════════════════

Products have ONE primary function. These are COMPLETELY DIFFERENT:

CLEANING products: "Brush", "Cleaner", "Cleaning Tool"
MOUNTS: "Mount", "Holder", "Bracket" (for phones/devices)
PROTECTION: "Protector", "Guard", "Shield", "Film", "PPF"
STORAGE: "Storage Box", "Bin", "Organizer", "Container"
MATS/LINERS: "Floor Mat", "Cargo Mat", "Liner"
DECORATIVE: "Trim", "Overlay", "Wrap", "Decal", "Cover" (aesthetic)
MOTORIZED: "Electric", "Power", "Automatic" (powered systems)

⚠️ NEVER mix: Cleaning ≠ Mount ≠ Protection ≠ Storage ≠ Motorized!

════════════════════════════════════════════════════════════════════
STEP 2: CHECK PRODUCT FORM FACTOR & SPECS
════════════════════════════════════════════════════════════════════

Form factor must match exactly:
- "Box" ≠ "Bin" ≠ "Tray" ≠ "Bag"
- "Mat" ≠ "Liner" ≠ "Cover"
- Manual ≠ Electric/Automatic

Specifications must match:
- Material: Leather ≠ TPE ≠ ABS ≠ Carbon Fiber
- Quantity: "2-piece" ≠ "4-piece", "Front" ≠ "Full set"
- Car version: Highland (2024+ M3) ≠ Pre-2024, Juniper (2025+ MY) ≠ Pre-2025

════════════════════════════════════════════════════════════════════
EXAMPLES OF WRONG MATCHES (NEVER DO THIS):
════════════════════════════════════════════════════════════════════

❌ "Air Vent Cleaning Brush" ($4) + "Air Vent Phone Mount" ($65) = WRONG
   → Brush=cleaning tool, Mount=phone holder, 16x price difference!

❌ "Frunk Mat" ($44) + "Electric Power Frunk System" ($459) = WRONG
   → Mat=passive liner, System=motorized opener, 10x price!

❌ "Gear Shift Cover" ($16) + "Gear Shift Stalks Replacement" ($129) = WRONG
   → Cover=decorative, Stalks=functional replacement parts!

❌ "Trunk Side Protector" + "Trunk Storage Box" = WRONG
   → Protector=protection, Box=storage (different functions!)

════════════════════════════════════════════════════════════════════
EXAMPLES OF CORRECT MATCHES:
════════════════════════════════════════════════════════════════════

✅ "TapTes Trunk Storage Box" ($89) + "Tesery Trunk Storage Box" ($79) = CORRECT
   → Same function, same form, similar price (1.1x ratio)

✅ "Model Y Floor Mat Full Set" ($150) + "Model Y Floor Mat Set" ($169) = CORRECT
   → Same function, same coverage, similar price (1.1x ratio)

════════════════════════════════════════════════════════════════════

OUTPUT FORMAT (JSON only):
{
  "groups": [
    {
      "name": "Exact product description",
      "products": [1, 3],
      "matchType": "exact",
      "confidence": "high",
      "reason": "Both are X for Y, same material, same specs, similar price"
    }
  ]
}

FINAL TESTS before matching:
1. "Would a customer accept product B as identical to product A?"
2. "Is the price difference less than 2.5x?"
3. "Do both products serve the EXACT same function?"

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
    let rejectedByValidation = 0;

    for (const group of result.groups || []) {
      if (group.products.length < 2) continue;

      const matchedProducts = group.products
        .map(idx => limitedProducts[idx - 1])
        .filter(p => p); // Filter out invalid indices

      // ====================================================================
      // POST-AI VALIDATION: Filter out bad matches the AI might have made
      // ====================================================================
      const validatedProducts = validateMatchGroup(matchedProducts);

      if (validatedProducts.length < 2) {
        rejectedByValidation++;
        continue;
      }

      // Verify multiple stores after validation
      const matchStores = new Set(validatedProducts.map(p => p.source));
      if (matchStores.size < 2) {
        rejectedByValidation++;
        continue;
      }

      // Calculate savings using validated products only
      const prices = validatedProducts.map(p => p.price).sort((a, b) => a - b);
      const lowestPrice = prices[0];
      const highestPrice = prices[prices.length - 1];
      const savings = highestPrice - lowestPrice;
      const savingsPercent = Math.round((savings / highestPrice) * 100);

      // Final price ratio check (belt and suspenders)
      const priceRatio = highestPrice / lowestPrice;
      if (priceRatio > MAX_PRICE_RATIO) {
        rejectedByValidation++;
        continue;
      }

      // Determine match type
      const matchType = group.matchType || (group.confidence === 'high' ? 'exact' : 'similar');

      // Different thresholds for exact vs similar
      if (matchType === 'exact') {
        if (savings < 5 || savingsPercent < 3) continue;
      } else {
        // More lenient for similar products - just need some price difference
        if (savings < 1) continue;
      }

      // Calculate average title similarity for quality metrics
      let totalSim = 0;
      let simCount = 0;
      for (let i = 0; i < validatedProducts.length; i++) {
        for (let j = i + 1; j < validatedProducts.length; j++) {
          totalSim += calculateTitleSimilarity(
            validatedProducts[i].title,
            validatedProducts[j].title
          );
          simCount++;
        }
      }
      const avgTitleSimilarity = simCount > 0 ? Math.round((totalSim / simCount) * 100) : 0;

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
        priceRatio: Math.round(priceRatio * 10) / 10,
        titleSimilarity: avgTitleSimilarity,
        products: validatedProducts.sort((a, b) => a.price - b.price)
      });
    }

    if (rejectedByValidation > 0) {
      process.stdout.write(`(${rejectedByValidation} rejected) `);
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

  // Calculate quality metrics
  const avgPriceRatio = allMatches.length > 0
    ? (allMatches.reduce((sum, m) => sum + m.priceRatio, 0) / allMatches.length).toFixed(1)
    : 0;
  const avgTitleSim = allMatches.length > 0
    ? Math.round(allMatches.reduce((sum, m) => sum + m.titleSimilarity, 0) / allMatches.length)
    : 0;

  console.log(`\n✓ AI matching complete:`);
  console.log(`  - ${exactMatches} exact matches (same product)`);
  console.log(`  - ${similarMatches} similar matches (comparable products)`);
  console.log(`  - ${allMatches.length} total matches`);
  console.log(`  - Quality: avg price ratio ${avgPriceRatio}x, avg title similarity ${avgTitleSim}%`);

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

    // Save matches to both locations
    await fs.writeFile(
      './data/ai-matches.json',
      JSON.stringify(matches, null, 2)
    );

    // Also save to web/data for the frontend
    await fs.writeFile(
      './web/data/ai-matches.json',
      JSON.stringify(matches, null, 2)
    );

    console.log(`\nSaved ${matches.length} matches to data/ai-matches.json and web/data/ai-matches.json`);

    // Print top deals
    console.log('\n💰 TOP AI-MATCHED DEALS:\n');
    matches.slice(0, 10).forEach((match, i) => {
      console.log(`${i + 1}. Save $${match.savings.toFixed(0)} (${match.savingsPercent}% off) - ${match.confidence} confidence`);
      console.log(`   "${match.name}"`);
      console.log(`   Quality: ${match.priceRatio}x price ratio, ${match.titleSimilarity}% title match`);
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
