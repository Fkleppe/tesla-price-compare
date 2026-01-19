import { BaseScraper } from './base.js';
import * as cheerio from 'cheerio';

export class TesmanianScraper extends BaseScraper {
  constructor() {
    super('Tesmanian', 'https://www.tesmanian.com');
  }

  async scrapeCategory(categoryUrl, categoryName) {
    const products = [];

    try {
      await this.page.goto(categoryUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      await this.delay(2000); // Wait for dynamic content

      const html = await this.page.content();
      const $ = cheerio.load(html);

      // Tesmanian uses a standard Shopify-like structure
      $('.product-item, .grid-product, [data-product-id]').each((i, el) => {
        const $el = $(el);

        const title = $el.find('.product-item__title, .grid-product__title, .product-title').text().trim()
          || $el.find('a').first().attr('title')
          || $el.find('h3, h2').first().text().trim();

        const priceText = $el.find('.price, .product-item__price, .grid-product__price, .money').first().text().trim();
        const price = this.parsePrice(priceText);

        const link = $el.find('a').first().attr('href');
        const fullLink = link?.startsWith('http') ? link : `${this.baseUrl}${link}`;

        const image = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');

        if (title && price) {
          products.push({
            title,
            price,
            currency: 'USD',
            url: fullLink,
            image,
            source: this.name,
            category: categoryName,
            scrapedAt: new Date().toISOString()
          });
        }
      });
    } catch (error) {
      console.error(`Error scraping ${categoryUrl}:`, error.message);
    }

    return products;
  }

  async scrape() {
    await this.init();

    const categories = [
      { url: `${this.baseUrl}/collections/tesla-model-3`, name: 'Model 3' },
      { url: `${this.baseUrl}/collections/tesla-model-y`, name: 'Model Y' },
      { url: `${this.baseUrl}/collections/tesla-model-s`, name: 'Model S' },
      { url: `${this.baseUrl}/collections/tesla-model-x`, name: 'Model X' },
    ];

    const allProducts = [];

    for (const category of categories) {
      console.log(`Scraping ${this.name} - ${category.name}...`);
      const products = await this.scrapeCategory(category.url, category.name);
      allProducts.push(...products);
      await this.delay(1500); // Be respectful with rate limiting
    }

    await this.close();

    console.log(`Found ${allProducts.length} products from ${this.name}`);
    return allProducts;
  }
}
