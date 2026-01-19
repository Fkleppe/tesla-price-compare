import { matchProducts, formatMatch } from './scrapers/product-matcher.js';
import { ShopifyAPIScraper } from './scrapers/shopify-api-scraper.js';
import { saveAllProducts, getLatestProducts, updatePriceHistory, saveMatches } from './storage.js';

async function runScraper() {
  console.log('🚗 Tesla Price Compare\n');
  console.log('='.repeat(50));

  // Use Shopify JSON API (much faster, no bot protection)
  const scraper = new ShopifyAPIScraper();

  try {
    const products = await scraper.scrapeAll();

    if (products.length > 0) {
      await saveAllProducts(products);
      await updatePriceHistory(products);

      const matches = matchProducts(products);
      await saveMatches(matches);

      // Summary
      console.log('\n' + '='.repeat(50));
      console.log('📊 SCRAPE COMPLETE\n');
      console.log(`Total products: ${products.length}`);

      // Group by source
      const bySource = {};
      for (const p of products) {
        bySource[p.source] = (bySource[p.source] || 0) + 1;
      }
      console.log('\nProducts by source:');
      Object.entries(bySource)
        .sort((a, b) => b[1] - a[1])
        .forEach(([source, count]) => {
          console.log(`  - ${source}: ${count}`);
        });

      console.log(`\n🔗 Found ${matches.length} price comparisons across stores`);

      if (matches.length > 0) {
        console.log('\n💰 TOP DEALS:');
        matches.slice(0, 5).forEach((match, i) => {
          console.log(`\n${i + 1}. Save $${match.savings.toFixed(2)} (${match.savingsPercent}% off)`);
          console.log(`   "${match.products[0].title.substring(0, 50)}..."`);
          match.products.slice(0, 3).forEach(p => {
            const marker = p.price === match.lowestPrice ? '✓ BEST' : '';
            console.log(`   $${p.price.toFixed(2)} at ${p.source} ${marker}`);
          });
        });
      }
    } else {
      console.log('\n⚠️  No products scraped. Check network/API availability.');
    }
  } catch (error) {
    console.error('Scraper error:', error);
  }
}

async function showDeals() {
  const products = await getLatestProducts();
  const matches = matchProducts(products);

  console.log('\n💰 PRICE COMPARISONS:\n');

  if (matches.length === 0) {
    console.log('No matching products found across stores yet.');
    return;
  }

  matches.slice(0, 20).forEach((match, i) => {
    console.log(`${i + 1}. Save $${match.savings.toFixed(2)} (${match.savingsPercent}% off)`);
    console.log(`   ${match.products[0].title.substring(0, 60)}`);
    match.products.forEach(p => {
      console.log(`   → $${p.price.toFixed(2)} at ${p.source}`);
    });
    console.log('');
  });
}

// CLI
const command = process.argv[2];

if (command === 'deals') {
  showDeals();
} else {
  runScraper();
}
