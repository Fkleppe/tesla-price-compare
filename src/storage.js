import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

export async function saveProducts(products, source) {
  await ensureDataDir();

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${source.toLowerCase()}-${timestamp}.json`;
  const filepath = path.join(DATA_DIR, filename);

  await fs.writeFile(filepath, JSON.stringify(products, null, 2));
  console.log(`Saved ${products.length} products to ${filepath}`);

  // Also update the combined latest file
  await updateLatestProducts(products, source);
}

export async function updateLatestProducts(newProducts, source) {
  await ensureDataDir();

  const latestPath = path.join(DATA_DIR, 'latest.json');
  let allProducts = [];

  try {
    const existing = await fs.readFile(latestPath, 'utf-8');
    allProducts = JSON.parse(existing);
    // Remove old products from same source
    allProducts = allProducts.filter(p => p.source !== source);
  } catch (error) {
    // File doesn't exist yet
  }

  allProducts.push(...newProducts);
  await fs.writeFile(latestPath, JSON.stringify(allProducts, null, 2));
}

export async function getLatestProducts() {
  const latestPath = path.join(DATA_DIR, 'latest.json');

  try {
    const data = await fs.readFile(latestPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Save all products (replaces entire file)
export async function saveAllProducts(products) {
  await ensureDataDir();

  const timestamp = new Date().toISOString().split('T')[0];
  const latestPath = path.join(DATA_DIR, 'latest.json');
  const backupPath = path.join(DATA_DIR, `backup-${timestamp}.json`);

  await fs.writeFile(latestPath, JSON.stringify(products, null, 2));
  await fs.writeFile(backupPath, JSON.stringify(products, null, 2));

  console.log(`Saved ${products.length} products to ${latestPath}`);
}

// Save product matches (products available from multiple stores)
export async function saveMatches(matches) {
  await ensureDataDir();

  const matchesPath = path.join(DATA_DIR, 'matches.json');
  await fs.writeFile(matchesPath, JSON.stringify(matches, null, 2));

  console.log(`Saved ${matches.length} product matches to ${matchesPath}`);
}

// Get product matches
export async function getMatches() {
  const matchesPath = path.join(DATA_DIR, 'matches.json');

  try {
    const data = await fs.readFile(matchesPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Generate a unique ID for a product based on title and source
function generateProductId(product) {
  const slug = product.title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);
  return `${product.source.toLowerCase()}-${slug}`;
}

// Track price history for products
export async function updatePriceHistory(products) {
  await ensureDataDir();

  const historyPath = path.join(DATA_DIR, 'price-history.json');
  let history = {};

  try {
    const existing = await fs.readFile(historyPath, 'utf-8');
    history = JSON.parse(existing);
  } catch (error) {
    // File doesn't exist yet
  }

  const today = new Date().toISOString().split('T')[0];

  for (const product of products) {
    const id = generateProductId(product);

    if (!history[id]) {
      history[id] = {
        title: product.title,
        source: product.source,
        category: product.category,
        url: product.url,
        prices: []
      };
    }

    // Only add one price per day
    const lastEntry = history[id].prices[history[id].prices.length - 1];
    if (!lastEntry || lastEntry.date !== today) {
      history[id].prices.push({
        date: today,
        price: product.price
      });
    } else {
      // Update today's price if it changed
      lastEntry.price = product.price;
    }

    // Keep last 90 days of history
    if (history[id].prices.length > 90) {
      history[id].prices = history[id].prices.slice(-90);
    }
  }

  await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
  console.log(`Updated price history for ${Object.keys(history).length} products`);
}

export async function getPriceHistory() {
  const historyPath = path.join(DATA_DIR, 'price-history.json');

  try {
    const data = await fs.readFile(historyPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

export async function findDeals(products) {
  // Group by similar product names and find price differences
  const deals = [];

  // Simple grouping by keywords in title
  const grouped = {};

  for (const product of products) {
    const keywords = product.title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 3)
      .join('-');

    if (!grouped[keywords]) {
      grouped[keywords] = [];
    }
    grouped[keywords].push(product);
  }

  // Find items with multiple sources
  for (const [key, items] of Object.entries(grouped)) {
    if (items.length > 1) {
      const sorted = items.sort((a, b) => a.price - b.price);
      const cheapest = sorted[0];
      const mostExpensive = sorted[sorted.length - 1];

      if (mostExpensive.price > cheapest.price * 1.1) {
        deals.push({
          keyword: key,
          cheapest,
          savings: mostExpensive.price - cheapest.price,
          percentOff: Math.round((1 - cheapest.price / mostExpensive.price) * 100)
        });
      }
    }
  }

  return deals.sort((a, b) => b.savings - a.savings);
}
