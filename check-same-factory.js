import { getLatestProducts } from './src/storage.js';
import stringSimilarity from 'string-similarity';

const products = await getLatestProducts();

// Look for very similar products from different stores
console.log('=== CHECKING FOR SAME-FACTORY PRODUCTS ===\n');

// Focus on specific product types where rebranding is common
const categories = ['diffuser', 'spoiler', 'floor mat', 'screen protector', 'center console', 'sunshade'];

for (const category of categories) {
  console.log(`\n--- ${category.toUpperCase()} ---`);

  const categoryProducts = products.filter(p =>
    p.title.toLowerCase().includes(category)
  );

  // Group by Tesla model
  const model3 = categoryProducts.filter(p => p.title.toLowerCase().includes('model 3') || p.title.toLowerCase().includes('model3'));
  const modelY = categoryProducts.filter(p => p.title.toLowerCase().includes('model y') || p.title.toLowerCase().includes('modely'));

  // Check Model Y products for very similar items
  if (modelY.length > 5) {
    console.log(`\nModel Y ${category} (${modelY.length} products):`);

    // Find pairs with very high similarity
    const pairs = [];
    for (let i = 0; i < modelY.length && i < 50; i++) {
      for (let j = i + 1; j < modelY.length && j < 50; j++) {
        if (modelY[i].source === modelY[j].source) continue;

        const sim = stringSimilarity.compareTwoStrings(
          modelY[i].title.toLowerCase(),
          modelY[j].title.toLowerCase()
        );

        if (sim > 0.6) {
          const priceRatio = Math.max(modelY[i].price, modelY[j].price) /
                            Math.min(modelY[i].price, modelY[j].price);
          pairs.push({
            sim,
            priceRatio,
            p1: modelY[i],
            p2: modelY[j]
          });
        }
      }
    }

    // Show top pairs
    pairs.sort((a, b) => b.sim - a.sim).slice(0, 5).forEach(pair => {
      const samePriceRange = pair.priceRatio < 1.5 ? '✓ SAME PRICE RANGE' : '';
      console.log(`\n  Similarity: ${(pair.sim * 100).toFixed(0)}% | Price ratio: ${pair.priceRatio.toFixed(2)} ${samePriceRange}`);
      console.log(`    $${pair.p1.price.toString().padStart(6)} @ ${pair.p1.source.padEnd(15)} "${pair.p1.title.slice(0, 50)}..."`);
      console.log(`    $${pair.p2.price.toString().padStart(6)} @ ${pair.p2.source.padEnd(15)} "${pair.p2.title.slice(0, 50)}..."`);
    });
  }
}

// Also check: products with IDENTICAL prices (strong indicator of same factory)
console.log('\n\n=== PRODUCTS WITH IDENTICAL OR VERY CLOSE PRICES ===\n');

const priceGroups = {};
products.forEach(p => {
  const priceKey = Math.round(p.price); // Round to nearest dollar
  if (!priceGroups[priceKey]) priceGroups[priceKey] = [];
  priceGroups[priceKey].push(p);
});

// Find price points with products from multiple stores
Object.entries(priceGroups)
  .filter(([price, prods]) => {
    const stores = new Set(prods.map(p => p.source));
    return stores.size >= 3 && prods.length >= 4;
  })
  .slice(0, 10)
  .forEach(([price, prods]) => {
    const stores = [...new Set(prods.map(p => p.source))];
    console.log(`\n$${price} - ${prods.length} products from ${stores.length} stores:`);
    prods.slice(0, 6).forEach(p => {
      console.log(`  ${p.source.padEnd(15)} "${p.title.slice(0, 55)}..."`);
    });
  });
