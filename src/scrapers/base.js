import puppeteer from 'puppeteer';

export class BaseScraper {
  constructor(name, baseUrl) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async scrape() {
    throw new Error('scrape() must be implemented by subclass');
  }

  // Helper to add delay between requests (be nice to servers)
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Normalize price string to number
  parsePrice(priceStr) {
    if (!priceStr) return null;
    const cleaned = priceStr.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || null;
  }
}
