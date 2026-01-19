import { getLatestProducts } from './src/storage.js';

const products = await getLatestProducts();

// Find all unique vendors (potential brands)
const vendorCounts = {};
products.forEach(p => {
  const v = (p.vendor || '').trim();
  if (v && v.length > 2) {
    vendorCounts[v] = (vendorCounts[v] || 0) + 1;
  }
});

// Check which vendors appear in product titles
console.log('=== VENDORS FOUND IN TITLES ===\n');

const vendorInTitles = {};
Object.keys(vendorCounts).forEach(vendor => {
  const searchTerm = vendor.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (searchTerm.length < 4) return;

  let matchCount = 0;
  products.forEach(p => {
    const titleLower = p.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (titleLower.includes(searchTerm)) {
      matchCount++;
    }
  });

  if (matchCount > 10) {
    vendorInTitles[vendor] = matchCount;
  }
});

Object.entries(vendorInTitles)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 40)
  .forEach(([vendor, count]) => {
    console.log(`${count.toString().padStart(4)} titles contain: "${vendor}"`);
  });

// Find brand names appearing in titles across multiple stores
console.log('\n\n=== BRAND NAMES IN TITLES (across stores) ===\n');

// Common brand patterns in Tesla accessories
const brandPatterns = [
  'taptes', 'tesery', 'adro', 'rpm', 'tesmanian', 'evannex',
  'ohmmu', 'jowua', 'maier', 'maxpider', '3d maxpider',
  'tesbros', 'weathertech', 'xpel', 'alpharex', 'yeslak',
  'marnana', 'topfit', 'basenor', 'xtauto', 'aosk',
  'hansshow', 'abstract ocean', 'alloygator', 'motrobe',
  'aroham', 'yztooauto', 'carwiner'
];

brandPatterns.forEach(brand => {
  const brandLower = brand.toLowerCase();
  const storesWithBrand = new Set();
  let count = 0;

  products.forEach(p => {
    const titleLower = p.title.toLowerCase();
    if (titleLower.includes(brandLower)) {
      storesWithBrand.add(p.source);
      count++;
    }
  });

  if (storesWithBrand.size >= 2 && count >= 5) {
    console.log(`"${brand}" - ${storesWithBrand.size} stores, ${count} products`);
    console.log(`  Stores: ${Array.from(storesWithBrand).join(', ')}`);
  }
});

// Look for store-exclusive brands (in vendor field but not in titles of other stores)
console.log('\n\n=== LIKELY STORE-EXCLUSIVE BRANDS ===\n');

const storeExclusiveBrands = [];
Object.entries(vendorCounts)
  .filter(([v, c]) => c >= 20)
  .forEach(([vendor, count]) => {
    const vendorLower = vendor.toLowerCase();
    const storesWithVendor = new Set();

    products.forEach(p => {
      if ((p.vendor || '').toLowerCase() === vendorLower) {
        storesWithVendor.add(p.source);
      }
    });

    if (storesWithVendor.size === 1) {
      const store = Array.from(storesWithVendor)[0];
      console.log(`"${vendor}" (${count} products) - only at ${store}`);
    }
  });
