import { getLatestProducts } from './src/storage.js';

const products = await getLatestProducts();

// Look at 3D MAXpider products specifically
console.log('=== 3D MAXpider Products ===\n');

const maxpiderProducts = products.filter(p =>
  (p.vendor || '').toLowerCase().includes('3d max') ||
  p.title.toLowerCase().includes('3d maxpider') ||
  p.title.toLowerCase().includes('maxpider')
);

console.log(`Found ${maxpiderProducts.length} 3D MAXpider products\n`);

// Group by store
const byStore = {};
maxpiderProducts.forEach(p => {
  if (!byStore[p.source]) byStore[p.source] = [];
  byStore[p.source].push(p);
});

Object.entries(byStore).forEach(([store, prods]) => {
  console.log(`\n--- ${store} (${prods.length} products) ---`);
  prods.slice(0, 10).forEach(p => {
    console.log(`  $${p.price.toString().padStart(6)} | ${p.title.slice(0, 60)}`);
  });
});

// Now look at Jowua products
console.log('\n\n=== Jowua Products ===\n');

const jowuaProducts = products.filter(p =>
  (p.vendor || '').toLowerCase().includes('jowua') ||
  p.title.toLowerCase().includes('jowua')
);

console.log(`Found ${jowuaProducts.length} Jowua products\n`);

const jowuaByStore = {};
jowuaProducts.forEach(p => {
  if (!jowuaByStore[p.source]) jowuaByStore[p.source] = [];
  jowuaByStore[p.source].push(p);
});

Object.entries(jowuaByStore).forEach(([store, prods]) => {
  console.log(`\n--- ${store} (${prods.length} products) ---`);
  prods.slice(0, 10).forEach(p => {
    console.log(`  $${p.price.toString().padStart(6)} | ${p.title.slice(0, 60)}`);
  });
});

// Now look at Ohmmu products (12V batteries)
console.log('\n\n=== Ohmmu Products (12V Batteries) ===\n');

const ohmmuProducts = products.filter(p =>
  (p.vendor || '').toLowerCase().includes('ohmmu') ||
  p.title.toLowerCase().includes('ohmmu')
);

console.log(`Found ${ohmmuProducts.length} Ohmmu products\n`);

ohmmuProducts.forEach(p => {
  console.log(`  $${p.price.toString().padStart(6)} @ ${p.source.padEnd(15)} | ${p.title.slice(0, 55)}`);
});

// Abstract Ocean products
console.log('\n\n=== Abstract Ocean Products ===\n');

const aoProducts = products.filter(p =>
  (p.vendor || '').toLowerCase().includes('abstract ocean')
);

console.log(`Found ${aoProducts.length} Abstract Ocean products\n`);

const aoByStore = {};
aoProducts.forEach(p => {
  if (!aoByStore[p.source]) aoByStore[p.source] = [];
  aoByStore[p.source].push(p);
});

Object.entries(aoByStore).forEach(([store, prods]) => {
  console.log(`\n--- ${store} (${prods.length} products) ---`);
  prods.slice(0, 8).forEach(p => {
    console.log(`  $${p.price.toString().padStart(6)} | ${p.title.slice(0, 60)}`);
  });
});
