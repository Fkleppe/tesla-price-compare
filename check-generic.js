import fs from 'fs/promises';

const matchesData = await fs.readFile('./data/matches.json', 'utf-8');
const matches = JSON.parse(matchesData);

console.log('=== ALL GENERIC MATCHES ===\n');
const genericMatches = matches.filter(m => m.brand === 'generic');

genericMatches.forEach((m, i) => {
  console.log(`${i + 1}. ${m.products[0].title.slice(0, 65)}`);
  console.log(`   Category: ${m.category} | Save $${m.savings.toFixed(2)} (${m.savingsPercent}%)`);
  m.products.forEach(p => {
    console.log(`     $${p.price.toFixed(2).padStart(7)} @ ${p.source.padEnd(15)} | Vendor: ${(p.vendor || 'n/a').slice(0, 25)}`);
  });
  console.log('');
});
