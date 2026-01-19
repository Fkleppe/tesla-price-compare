import axios from 'axios';
import * as cheerio from 'cheerio';

// Simple HTTP-based scraper (no browser, faster, less detectable)
export class SimpleScraper {
  constructor(name, baseUrl) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    };
  }

  async fetchPage(url) {
    const response = await axios.get(url, { headers: this.headers, timeout: 15000 });
    return cheerio.load(response.data);
  }

  parsePrice(priceStr) {
    if (!priceStr) return null;
    const cleaned = priceStr.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || null;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// EVANNEX - Tesla accessories shop
export class EvannexScraper extends SimpleScraper {
  constructor() {
    super('EVANNEX', 'https://evannex.com');
  }

  async scrape() {
    const products = [];

    try {
      console.log(`Fetching ${this.name}...`);
      const $ = await this.fetchPage(`${this.baseUrl}/collections/all`);

      $('.product-card, .product-item, .grid__item').each((i, el) => {
        const $el = $(el);

        const title = $el.find('.product-card__title, .product-title, h3 a, h2 a').first().text().trim();
        const priceText = $el.find('.price, .product-price, .money').first().text().trim();
        const price = this.parsePrice(priceText);

        let link = $el.find('a').first().attr('href') || '';
        if (link && !link.startsWith('http')) {
          link = `${this.baseUrl}${link}`;
        }

        if (title && price) {
          products.push({
            title,
            price,
            currency: 'USD',
            url: link,
            source: this.name,
            category: 'All',
            scrapedAt: new Date().toISOString()
          });
        }
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }

    console.log(`Found ${products.length} products from ${this.name}`);
    return products;
  }
}

// Demo scraper with sample data for testing
export class DemoScraper extends SimpleScraper {
  constructor() {
    super('Demo', 'https://example.com');
  }

  async scrape() {
    // Sample Tesla accessory data for testing
    const sampleProducts = [
      { title: 'Tesla Model 3 All-Weather Floor Mats', price: 129.99, category: 'Model 3' },
      { title: 'Tesla Model Y Cargo Mat', price: 89.99, category: 'Model Y' },
      { title: 'Tesla Wall Connector Gen 3', price: 425.00, category: 'Charging' },
      { title: 'Tesla Model 3 Center Console Wrap', price: 34.99, category: 'Model 3' },
      { title: 'Tesla Screen Protector 15" Display', price: 29.99, category: 'Accessories' },
      { title: 'Tesla Model Y Roof Rack', price: 449.00, category: 'Model Y' },
      { title: 'Tesla Wireless Phone Charger', price: 79.99, category: 'Accessories' },
      { title: 'Tesla Model 3 Mud Flaps', price: 44.99, category: 'Model 3' },
      { title: 'Tesla Portable Tire Inflator', price: 59.99, category: 'Accessories' },
      { title: 'Tesla Model Y Window Tint Kit', price: 149.99, category: 'Model Y' },
    ];

    return sampleProducts.map(p => ({
      ...p,
      currency: 'USD',
      url: `https://example.com/products/${p.title.toLowerCase().replace(/\s+/g, '-')}`,
      source: this.name,
      scrapedAt: new Date().toISOString()
    }));
  }
}
