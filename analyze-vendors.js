import { getLatestProducts } from './src/storage.js';

const products = await getLatestProducts();

// Find vendors that appear in multiple stores
console.log('=== VENDORS ACROSS MULTIPLE STORES ===\n');

const vendorToStores = {};
const vendorToProducts = {};

products.forEach(p => {
  const vendor = (p.vendor || '').toLowerCase().trim();
  if (!vendor || vendor === 'no vendor') return;

  if (!vendorToStores[vendor]) {
    vendorToStores[vendor] = new Set();
    vendorToProducts[vendor] = [];
  }
  vendorToStores[vendor].add(p.source);
  vendorToProducts[vendor].push(p);
});

// Filter to vendors in 2+ stores
const multiStoreVendors = Object.entries(vendorToStores)
  .filter(([vendor, stores]) => stores.size >= 2)
  .sort((a, b) => b[1].size - a[1].size);

console.log(`Found ${multiStoreVendors.length} vendors selling at multiple stores:\n`);

multiStoreVendors.slice(0, 30).forEach(([vendor, stores]) => {
  const productCount = vendorToProducts[vendor].length;
  console.log(`"${vendor}" - ${stores.size} stores, ${productCount} products`);
  console.log(`  Stores: ${Array.from(stores).join(', ')}`);

  // Show sample products from this vendor at different stores
  const byStore = {};
  vendorToProducts[vendor].forEach(p => {
    if (!byStore[p.source]) byStore[p.source] = [];
    byStore[p.source].push(p);
  });

  // Show one product from each store
  Object.entries(byStore).slice(0, 3).forEach(([store, prods]) => {
    const p = prods[0];
    console.log(`    $${p.price.toString().padStart(6)} @ ${store}: ${p.title.slice(0, 50)}`);
  });
  console.log('');
});

// Now look for SAME PRODUCT (by title) sold at different stores with same vendor
console.log('\n=== IDENTICAL PRODUCTS (same vendor + similar title) ===\n');

const potentialMatches = [];

multiStoreVendors.forEach(([vendor, stores]) => {
  const prods = vendorToProducts[vendor];

  // Group by normalized title
  const byTitle = {};
  prods.forEach(p => {
    const key = p.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 60);

    if (!byTitle[key]) byTitle[key] = [];
    byTitle[key].push(p);
  });

  // Find titles sold at multiple stores
  Object.entries(byTitle).forEach(([key, titleProds]) => {
    const titleStores = new Set(titleProds.map(p => p.source));
    if (titleStores.size >= 2) {
      potentialMatches.push({
        vendor,
        title: titleProds[0].title,
        products: titleProds,
        stores: titleStores.size
      });
    }
  });
});

console.log(`Found ${potentialMatches.length} potential identical products\n`);

// Sort by price difference (best deals first)
potentialMatches
  .map(m => {
    const prices = m.products.map(p => p.price).sort((a, b) => a - b);
    return {
      ...m,
      minPrice: prices[0],
      maxPrice: prices[prices.length - 1],
      savings: prices[prices.length - 1] - prices[0],
      savingsPercent: Math.round(((prices[prices.length - 1] - prices[0]) / prices[prices.length - 1]) * 100)
    };
  })
  .filter(m => m.savings > 5 && m.savingsPercent >= 5 && m.savingsPercent <= 60)
  .sort((a, b) => b.savings - a.savings)
  .slice(0, 30)
  .forEach((m, i) => {
    console.log(`${i + 1}. Save $${m.savings.toFixed(2)} (${m.savingsPercent}%)`);
    console.log(`   Vendor: ${m.vendor}`);
    console.log(`   ${m.title.slice(0, 70)}`);
    m.products.sort((a, b) => a.price - b.price).forEach(p => {
      console.log(`     $${p.price.toFixed(2).padStart(7)} @ ${p.source}`);
    });
    console.log('');
  });
