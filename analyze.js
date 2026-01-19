import { getLatestProducts } from './src/storage.js';

const products = await getLatestProducts();

console.log('=== SAMPLE PRODUCTS (full data) ===\n');

products.slice(0, 5).forEach((p, i) => {
  console.log(`${i+1}. ${p.title}`);
  console.log(`   Price: $${p.price}`);
  console.log(`   Source: ${p.source}`);
  console.log(`   URL: ${p.url}`);
  console.log(`   Image: ${p.image ? p.image.slice(0, 80) + '...' : 'none'}`);
  console.log(`   Vendor: ${p.vendor || 'n/a'}`);
  console.log(`   Product Type: ${p.productType || 'n/a'}`);
  console.log(`   Tags: ${(p.tags || []).slice(0, 5).join(', ')}`);
  console.log('');
});

// Look for floor mats specifically
console.log('\n=== FLOOR MATS ACROSS STORES ===\n');

const floorMats = products.filter(p =>
  p.title.toLowerCase().includes('floor') &&
  (p.title.toLowerCase().includes('mat') || p.title.toLowerCase().includes('liner'))
);

console.log(`Found ${floorMats.length} floor mat products\n`);

// Show some examples
floorMats.slice(0, 20).forEach(p => {
  console.log(`$${p.price.toString().padStart(6)} | ${p.source.padEnd(15)} | ${p.vendor || 'no vendor'}`);
  console.log(`         ${p.title.slice(0, 70)}`);
  console.log('');
});

// Check what vendor data we have
console.log('\n=== VENDOR ANALYSIS ===\n');

const vendorCounts = {};
products.forEach(p => {
  const v = p.vendor || 'NO VENDOR';
  vendorCounts[v] = (vendorCounts[v] || 0) + 1;
});

Object.entries(vendorCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([vendor, count]) => {
    console.log(`${count.toString().padStart(4)} products from vendor: "${vendor}"`);
  });

// Check productType field
console.log('\n=== PRODUCT TYPE ANALYSIS ===\n');

const typeCounts = {};
products.forEach(p => {
  const t = p.productType || 'NO TYPE';
  typeCounts[t] = (typeCounts[t] || 0) + 1;
});

Object.entries(typeCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([type, count]) => {
    console.log(`${count.toString().padStart(4)} products of type: "${type}"`);
  });

// Look at tags
console.log('\n=== COMMON TAGS ===\n');

const tagCounts = {};
products.forEach(p => {
  (p.tags || []).forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
});

Object.entries(tagCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)
  .forEach(([tag, count]) => {
    console.log(`${count.toString().padStart(4)}x "${tag}"`);
  });
