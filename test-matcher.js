import { matchProducts } from './src/scrapers/product-matcher.js';
import { getLatestProducts, saveMatches } from './src/storage.js';

const products = await getLatestProducts();
console.log(`Loaded ${products.length} products\n`);

const matches = matchProducts(products);
await saveMatches(matches);

console.log('\n' + '='.repeat(50));
console.log('TOP 15 DEALS:\n');

matches.slice(0, 15).forEach((m, i) => {
  console.log(`${i + 1}. ${m.products[0].title.slice(0, 60)}...`);
  console.log(`   Category: ${m.category} | Model: ${m.models[0]} | Brand: ${m.brand}`);
  console.log(`   Save $${m.savings.toFixed(2)} (${m.savingsPercent}%)`);
  m.products.forEach((p, j) => {
    const marker = j === 0 ? ' ← BEST' : '';
    console.log(`   $${p.price.toFixed(2).padStart(7)} @ ${p.source}${marker}`);
  });
  console.log('');
});

// Show brand distribution
console.log('\n=== MATCHES BY BRAND ===\n');
const brandCounts = {};
matches.forEach(m => {
  brandCounts[m.brand] = (brandCounts[m.brand] || 0) + 1;
});
Object.entries(brandCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([brand, count]) => {
    console.log(`${count.toString().padStart(4)} matches from brand: "${brand}"`);
  });
