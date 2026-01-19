import { BaseScraper } from './base.js';
import * as cheerio from 'cheerio';

export class AbstractOceanScraper extends BaseScraper {
  constructor() {
    super('AbstractOcean', 'https://abstractocean.com');
  }

  async scrapeCategory(categoryUrl, categoryName) {
    const products = [];

    try {
      await this.page.goto(categoryUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      await this.delay(2000);

      const html = await this.page.content();
      const $ = cheerio.load(html);

      // Abstract Ocean uses product-item class
      $('.product-item').each((i, el) => {
        const $el = $(el);

        const title = $el.find('.product-item-meta__title').text().trim();
        const priceText = $el.find('.price-list .price, .price').first().text().trim();
        const price = this.parsePrice(priceText);

        const link = $el.find('a').first().attr('href');
        const fullLink = link?.startsWith('http') ? link : `${this.baseUrl}${link}`;

        const image = $el.find('img').first().attr('src')
          || $el.find('img').first().attr('data-src')
          || $el.find('img').first().attr('data-srcset')?.split(' ')[0];

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
      { url: `${this.baseUrl}/collections/all`, name: 'All Products' },
    ];

    const allProducts = [];

    for (const category of categories) {
      console.log(`Scraping ${this.name} - ${category.name}...`);
      const products = await this.scrapeCategory(category.url, category.name);
      allProducts.push(...products);
      await this.delay(1500);
    }

    await this.close();

    console.log(`Found ${allProducts.length} products from ${this.name}`);
    return allProducts;
  }
}
