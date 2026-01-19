import axios from 'axios';
import { PRODUCT_CATEGORIES, TESLA_MODELS } from './sites-config.js';

// Shopify stores expose /products.json - no bot protection!
const SHOPIFY_SITES = [
  // Major Tesla accessory stores
  { name: 'Tesmanian', id: 'tesmanian', url: 'https://www.tesmanian.com' },
  { name: 'Tesery', id: 'tesery', url: 'https://www.tesery.com' },
  { name: 'Teslarati Shop', id: 'teslarati', url: 'https://shop.teslarati.com' },
  { name: 'Yeslak', id: 'yeslak', url: 'https://www.yeslak.com' },
  { name: 'Teslahubs', id: 'teslahubs', url: 'https://teslahubs.com' },
  { name: 'EVANNEX', id: 'evannex', url: 'https://evannex.com' },
  { name: 'Abstract Ocean', id: 'abstractocean', url: 'https://abstractocean.com' },
  { name: 'RPM Tesla', id: 'rpmtesla', url: 'https://www.rpmtesla.com' },
  { name: 'TESBROS', id: 'tesbros', url: 'https://tesbros.com' },
  { name: 'TapTes', id: 'taptes', url: 'https://www.taptes.com' },
  { name: 'Hansshow', id: 'hansshow', url: 'https://www.hautopart.com' },
  { name: 'EV Sportline', id: 'evsportline', url: 'https://evsportline.com' },
  { name: 'JOWUA', id: 'jowua', url: 'https://www.jowua-life.com' },
  { name: 'TPARTS', id: 'tparts', url: 'https://tparts.com' },
  { name: 'T Sportline', id: 'tsportline', url: 'https://tsportline.com' },
  { name: 'Basenor', id: 'basenor', url: 'https://www.basenor.com' },

  // Additional stores
  { name: 'Tesla Offer', id: 'teslaoffer', url: 'https://www.teslaoffer.com' },
  { name: 'Tlyard', id: 'tlyard', url: 'https://www.tlyard.com' },
  { name: 'Aroham', id: 'aroham', url: 'https://www.aroham.net' },
  { name: 'Tes Notes', id: 'tesnotes', url: 'https://tesnotes.com' },
  { name: 'Tesla Icons', id: 'teslaicons', url: 'https://teslaicons.com' },
  { name: 'Teslaunch', id: 'teslaunch', url: 'https://teslaunch.com' },
  { name: 'EV Wheel Direct', id: 'evwheeldirect', url: 'https://www.evwheeldirect.com' },
  { name: 'Unplugged Performance', id: 'unplugged', url: 'https://unpluggedperformance.com' },
  { name: 'Mountain Pass Performance', id: 'mpp', url: 'https://www.mountainpassperformance.com' },
  { name: 'Tesla Maison', id: 'teslamaison', url: 'https://teslamaison.com' },
  { name: 'Volta Wheels', id: 'voltawheels', url: 'https://voltawheels.com' },
  { name: 'Spigen Tesla', id: 'spigentesla', url: 'https://www.spigen.com' },
  { name: 'OZ Wheels', id: 'ozwheels', url: 'https://www.ozracing.com' },
  { name: 'Vorsteiner', id: 'vorsteiner', url: 'https://www.vorsteiner.com' },
  { name: 'Carbon Fiber Gear', id: 'carbonfiberstore', url: 'https://carbonfiberstore.com' },
];

export class ShopifyAPIScraper {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'application/json',
    };
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  detectCategory(title) {
    const lowerTitle = title.toLowerCase();
    for (const cat of PRODUCT_CATEGORIES) {
      if (cat.keywords.some(kw => lowerTitle.includes(kw))) {
        return cat.id;
      }
    }
    return 'other';
  }

  detectModel(title) {
    const lowerTitle = title.toLowerCase();
    const models = [];
    for (const model of TESLA_MODELS) {
      if (model.keywords.some(kw => lowerTitle.includes(kw))) {
        models.push(model.id);
      }
    }
    return models.length > 0 ? models : ['universal'];
  }

  generateMatchKey(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(w => w.length > 2)
      .filter(w => !['for', 'and', 'the', 'with', 'set', 'pcs', 'pack'].includes(w))
      .sort()
      .slice(0, 6)
      .join('-');
  }

  async scrapeSite(site) {
    const products = [];
    let page = 1;
    let hasMore = true;

    console.log(`  Trying ${site.name}...`);

    while (hasMore && page <= 20) {
      try {
        const url = `${site.url}/products.json?limit=250&page=${page}`;
        const response = await axios.get(url, {
          headers: this.headers,
          timeout: 15000
        });

        const data = response.data;

        if (!data.products || data.products.length === 0) {
          hasMore = false;
          continue;
        }

        for (const product of data.products) {
          // Get the first variant's price (or default)
          const variant = product.variants?.[0];
          const price = parseFloat(variant?.price) || 0;

          if (price <= 0) continue;

          // Get the best image
          const image = product.images?.[0]?.src || product.image?.src || '';

          products.push({
            title: product.title,
            price,
            currency: 'USD',
            url: `${site.url}/products/${product.handle}`,
            image,
            source: site.name,
            sourceId: site.id,
            category: this.detectCategory(product.title),
            models: this.detectModel(product.title),
            matchKey: this.generateMatchKey(product.title),
            description: product.body_html?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
            vendor: product.vendor || '',
            productType: product.product_type || '',
            tags: product.tags || [],
            scrapedAt: new Date().toISOString()
          });
        }

        console.log(`    Page ${page}: ${data.products.length} products`);
        page++;

        // Small delay between pages
        await this.delay(500);

      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`    ✗ No JSON API available`);
        } else if (error.response?.status === 403) {
          console.log(`    ✗ API blocked (403)`);
        } else {
          console.log(`    ✗ Error: ${error.message}`);
        }
        hasMore = false;
      }
    }

    if (products.length > 0) {
      console.log(`    ✓ Found ${products.length} products`);
    }

    return products;
  }

  async scrapeAll() {
    console.log('🛒 Shopify JSON API Scraper\n');

    const allProducts = [];

    for (const site of SHOPIFY_SITES) {
      const products = await this.scrapeSite(site);
      allProducts.push(...products);

      // Delay between sites
      await this.delay(1000);
    }

    console.log(`\n📊 Total: ${allProducts.length} products from Shopify API`);
    return allProducts;
  }
}
