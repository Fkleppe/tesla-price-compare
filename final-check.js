import fs from 'fs/promises';
import stringSimilarity from 'string-similarity';

const matchesData = await fs.readFile('./data/matches.json', 'utf-8');
const matches = JSON.parse(matchesData);

console.log('=== FINAL QUALITY CHECK ===\n');

// Calculate average title similarity for each match
const matchesWithSimilarity = matches.map(m => {
  // Calculate average pairwise similarity
  let totalSim = 0;
  let count = 0;
  for (let i = 0; i < m.products.length; i++) {
    for (let j = i + 1; j < m.products.length; j++) {
      totalSim += stringSimilarity.compareTwoStrings(
        m.products[i].title.toLowerCase(),
        m.products[j].title.toLowerCase()
      );
      count++;
    }
  }
  return {
    ...m,
    avgSimilarity: count > 0 ? totalSim / count : 0,
    priceRatio: m.highestPrice / m.lowestPrice
  };
});

// Group by quality
const highQuality = matchesWithSimilarity.filter(m => m.avgSimilarity >= 0.8 && m.priceRatio <= 1.5);
const mediumQuality = matchesWithSimilarity.filter(m => m.avgSimilarity >= 0.7 && m.priceRatio <= 2.0 && !highQuality.includes(m));
const lowerQuality = matchesWithSimilarity.filter(m => !highQuality.includes(m) && !mediumQuality.includes(m));

console.log(`HIGH QUALITY (80%+ similarity, <1.5x price): ${highQuality.length} matches`);
console.log(`MEDIUM QUALITY (70%+ similarity, <2x price): ${mediumQuality.length} matches`);
console.log(`LOWER QUALITY (rest): ${lowerQuality.length} matches`);

console.log('\n\n=== HIGH QUALITY MATCHES (DEFINITELY SAME PRODUCT) ===\n');
highQuality.slice(0, 15).forEach((m, i) => {
  console.log(`${i+1}. ${(m.avgSimilarity * 100).toFixed(0)}% similar | Price: $${m.lowestPrice.toFixed(0)}-$${m.highestPrice.toFixed(0)} (${m.priceRatio.toFixed(2)}x)`);
  console.log(`   Save $${m.savings.toFixed(0)} (${m.savingsPercent}%)`);
  m.products.forEach(p => {
    console.log(`     $${p.price.toFixed(2).padStart(7)} @ ${p.source.padEnd(15)} "${p.title.slice(0, 45)}..."`);
  });
  console.log('');
});

console.log('\n=== SAMPLE LOWER QUALITY MATCHES (MIGHT BE DIFFERENT) ===\n');
lowerQuality.slice(0, 5).forEach((m, i) => {
  console.log(`${i+1}. ${(m.avgSimilarity * 100).toFixed(0)}% similar | Price ratio: ${m.priceRatio.toFixed(2)}x`);
  m.products.forEach(p => {
    console.log(`     $${p.price.toFixed(2).padStart(7)} @ ${p.source.padEnd(15)} "${p.title.slice(0, 45)}..."`);
  });
  console.log('');
});

// Summary stats
console.log('\n=== SUMMARY ===');
console.log(`Total matches: ${matches.length}`);
console.log(`High quality (same product): ${highQuality.length} (${(highQuality.length/matches.length*100).toFixed(0)}%)`);
console.log(`Medium quality (likely same): ${mediumQuality.length} (${(mediumQuality.length/matches.length*100).toFixed(0)}%)`);
console.log(`Lower quality (uncertain): ${lowerQuality.length} (${(lowerQuality.length/matches.length*100).toFixed(0)}%)`);

// Total potential savings in high quality matches
const highQualitySavings = highQuality.reduce((sum, m) => sum + m.savings, 0);
console.log(`\nTotal savings in high-quality matches: $${highQualitySavings.toFixed(0)}`);
