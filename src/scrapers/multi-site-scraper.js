import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import { SITES, PRODUCT_CATEGORIES, TESLA_MODELS } from './sites-config.js';

puppeteer.use(StealthPlugin());

export class MultiSiteScraper {
  constructor() {
    this.browser = null;
    this.results = [];
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  parsePrice(priceStr) {
    if (!priceStr) return null;
    // Handle price ranges - take the first price
    const match = priceStr.match(/[\d,]+\.?\d*/);
    if (!match) return null;
    const cleaned = match[0].replace(/,/g, '');
    return parseFloat(cleaned) || null;
  }

  // Detect product category from title
  detectCategory(title) {
    const lowerTitle = title.toLowerCase();
    for (const cat of PRODUCT_CATEGORIES) {
      if (cat.keywords.some(kw => lowerTitle.includes(kw))) {
        return cat.id;
      }
    }
    return 'other';
  }

  // Detect Tesla model from title
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

  // Generate a normalized product key for matching similar products
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
    const page = await this.browser.newPage();
    const products = [];

    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      await page.setViewport({ width: 1920, height: 1080 });

      const urls = site.collectionsUrls || [site.collectionsUrl];

      for (const baseUrl of urls) {
        let pageNum = 1;
        let hasMore = true;

        while (hasMore && pageNum <= (site.pagination?.maxPages || 5)) {
          const url = pageNum === 1 ? baseUrl : `${baseUrl}?page=${pageNum}`;
          console.log(`  Fetching: ${url}`);

          try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            await this.delay(2000 + Math.random() * 1000);

            // Scroll to load lazy content
            await page.evaluate(async () => {
              await new Promise(resolve => {
                let totalHeight = 0;
                const distance = 300;
                const timer = setInterval(() => {
                  window.scrollBy(0, distance);
                  totalHeight += distance;
                  if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                  }
                }, 100);
                setTimeout(() => { clearInterval(timer); resolve(); }, 5000);
              });
            });

            await this.delay(1000);

            const html = await page.content();
            const $ = cheerio.load(html);

            const pageProducts = this.extractProducts($, site);

            if (pageProducts.length === 0) {
              hasMore = false;
            } else {
              products.push(...pageProducts);
              pageNum++;
            }

            // Rate limiting
            await this.delay(1500 + Math.random() * 1000);

          } catch (error) {
            console.log(`    Page error: ${error.message}`);
            hasMore = false;
          }
        }
      }
    } catch (error) {
      console.error(`  Site error: ${error.message}`);
    } finally {
      await page.close();
    }

    return products;
  }

  extractProducts($, site) {
    const products = [];
    const selectors = site.selectors;

    // Try multiple selector strategies
    const productElements = $(selectors.productList);

    productElements.each((i, el) => {
      try {
        const $el = $(el);

        // Extract title
        let title = '';
        for (const sel of selectors.title.split(', ')) {
          title = $el.find(sel).first().text().trim();
          if (!title) {
            title = $el.find(sel).first().attr('title') || '';
          }
          if (title) break;
        }

        // Extract price
        let price = null;
        for (const sel of selectors.price.split(', ')) {
          const priceText = $el.find(sel).first().text().trim();
          price = this.parsePrice(priceText);
          if (price) break;
        }

        // Extract link
        let link = $el.find(selectors.link).first().attr('href') || '';
        if (link && !link.startsWith('http')) {
          link = site.baseUrl + (link.startsWith('/') ? '' : '/') + link;
        }

        // Extract image
        let image = $el.find(selectors.image).first().attr('src')
          || $el.find(selectors.image).first().attr('data-src')
          || $el.find(selectors.image).first().attr('data-srcset')?.split(' ')[0]
          || '';

        if (image && !image.startsWith('http')) {
          if (image.startsWith('//')) {
            image = 'https:' + image;
          } else {
            image = site.baseUrl + (image.startsWith('/') ? '' : '/') + image;
          }
        }

        // Only add valid products
        if (title && title.length > 5 && price && price > 0) {
          products.push({
            title,
            price,
            currency: 'USD',
            url: link,
            image,
            source: site.name,
            sourceId: site.id,
            category: this.detectCategory(title),
            models: this.detectModel(title),
            matchKey: this.generateMatchKey(title),
            scrapedAt: new Date().toISOString()
          });
        }
      } catch (e) {
        // Skip invalid product
      }
    });

    return products;
  }

  async scrapeAll(siteIds = null) {
    await this.init();

    const sitesToScrape = siteIds
      ? SITES.filter(s => siteIds.includes(s.id))
      : SITES;

    const allProducts = [];

    for (const site of sitesToScrape) {
      console.log(`\n📦 Scraping ${site.name}...`);

      try {
        const products = await this.scrapeSite(site);
        console.log(`  ✓ Found ${products.length} products`);
        allProducts.push(...products);
      } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
      }

      // Delay between sites
      await this.delay(3000 + Math.random() * 2000);
    }

    await this.close();

    console.log(`\n📊 Total: ${allProducts.length} products from ${sitesToScrape.length} sites`);
    return allProducts;
  }
}

// Generate a flexible match key based on category and model
function generateFlexMatchKey(product) {
  const title = product.title.toLowerCase();
  const category = product.category || 'other';
  const models = (product.models || ['universal']).sort().join('-');

  // Extract key product terms
  const keyTerms = [];

  // Color/material terms
  const materials = ['carbon', 'leather', 'alcantara', 'suede', 'wood', 'chrome', 'matte', 'glossy'];
  const colors = ['black', 'white', 'red', 'blue', 'gray', 'grey'];

  for (const term of [...materials, ...colors]) {
    if (title.includes(term)) keyTerms.push(term);
  }

  // Size/quantity terms
  const sizeMatch = title.match(/(\d+)\s*(pcs?|piece|set|pack)/i);
  if (sizeMatch) keyTerms.push(`${sizeMatch[1]}pcs`);

  // Position terms for floor mats
  if (category === 'floor-mats') {
    if (title.includes('front')) keyTerms.push('front');
    if (title.includes('rear') || title.includes('back')) keyTerms.push('rear');
    if (title.includes('full') || title.includes('complete') || title.includes('all')) keyTerms.push('full');
  }

  return `${category}|${models}|${keyTerms.sort().join('-')}`;
}

// Product matcher - finds similar products across sites
export function matchProducts(products) {
  // Group by flexible key (category + model + key features)
  const flexMatches = {};

  for (const product of products) {
    const flexKey = generateFlexMatchKey(product);
    if (!flexMatches[flexKey]) {
      flexMatches[flexKey] = {
        matchKey: flexKey,
        category: product.category,
        models: product.models,
        products: []
      };
    }
    flexMatches[flexKey].products.push(product);
  }

  // Also try matching by exact matchKey (original method)
  const exactMatches = {};
  for (const product of products) {
    const key = product.matchKey;
    if (!exactMatches[key]) {
      exactMatches[key] = {
        matchKey: key,
        category: product.category,
        models: product.models,
        products: []
      };
    }
    exactMatches[key].products.push(product);
  }

  // Combine both approaches
  const allMatches = { ...flexMatches };
  for (const [key, match] of Object.entries(exactMatches)) {
    if (!allMatches[key]) {
      allMatches[key] = match;
    }
  }

  // Only keep matches with products from multiple sources
  const multiSourceMatches = Object.values(allMatches).filter(m => {
    const sources = new Set(m.products.map(p => p.sourceId));
    return sources.size > 1;
  });

  // Sort by price difference (best deals first)
  return multiSourceMatches.map(m => {
    const prices = m.products.map(p => p.price).sort((a, b) => a - b);
    const lowestPrice = prices[0];
    const highestPrice = prices[prices.length - 1];
    const savings = highestPrice - lowestPrice;
    const savingsPercent = Math.round((savings / highestPrice) * 100);

    return {
      ...m,
      lowestPrice,
      highestPrice,
      savings,
      savingsPercent,
      products: m.products.sort((a, b) => a.price - b.price)
    };
  }).sort((a, b) => b.savingsPercent - a.savingsPercent);
}
