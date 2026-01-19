import { getLatestProducts } from './src/storage.js';
import fs from 'fs/promises';

const matchesData = await fs.readFile('./data/matches.json', 'utf-8');
const matches = JSON.parse(matchesData);

console.log('=== 3D MAXPIDER MATCHES ===\n');
const maxpiderMatches = matches.filter(m => m.brand && m.brand.includes('maxpider'));
maxpiderMatches.forEach((m, i) => {
  console.log(`${i + 1}. ${m.products[0].title.slice(0, 65)}`);
  console.log(`   Save $${m.savings.toFixed(2)} (${m.savingsPercent}%)`);
  m.products.forEach(p => {
    console.log(`     $${p.price.toFixed(2).padStart(7)} @ ${p.source}`);
  });
  console.log('');
});

console.log('\n=== TESBROS MATCHES ===\n');
const tesbrosMatches = matches.filter(m => m.brand === 'tesbros');
tesbrosMatches.slice(0, 10).forEach((m, i) => {
  console.log(`${i + 1}. ${m.products[0].title.slice(0, 65)}`);
  console.log(`   Save $${m.savings.toFixed(2)} (${m.savingsPercent}%)`);
  m.products.forEach(p => {
    console.log(`     $${p.price.toFixed(2).padStart(7)} @ ${p.source}`);
  });
  console.log('');
});

console.log('\n=== MAIER MATCHES ===\n');
const maierMatches = matches.filter(m => m.brand === 'maier');
maierMatches.forEach((m, i) => {
  console.log(`${i + 1}. ${m.products[0].title.slice(0, 65)}`);
  console.log(`   Save $${m.savings.toFixed(2)} (${m.savingsPercent}%)`);
  m.products.forEach(p => {
    console.log(`     $${p.price.toFixed(2).padStart(7)} @ ${p.source}`);
  });
  console.log('');
});

// Spot check some generic matches
console.log('\n=== SAMPLE GENERIC MATCHES (verify quality) ===\n');
const genericMatches = matches.filter(m => m.brand === 'generic');
// Pick random samples
[0, 50, 100, 150, 200].forEach(idx => {
  if (genericMatches[idx]) {
    const m = genericMatches[idx];
    console.log(`#${idx + 1}. ${m.products[0].title.slice(0, 65)}`);
    console.log(`   Category: ${m.category} | Model: ${m.models[0]}`);
    console.log(`   Save $${m.savings.toFixed(2)} (${m.savingsPercent}%)`);
    m.products.forEach(p => {
      console.log(`     $${p.price.toFixed(2).padStart(7)} @ ${p.source} - "${p.title.slice(0, 50)}..."`);
    });
    console.log('');
  }
});
