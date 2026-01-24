import { NextResponse } from 'next/server';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, CATEGORIES, TESLA_MODELS, TOP_10_LISTS } from '@/lib/constants';
import { promises as fs } from 'fs';
import path from 'path';
import { isAffiliatePartner, getDiscountInfo, AFFILIATE_PARTNERS } from '@/lib/affiliate';

interface Product {
  title: string;
  price: number;
  source: string;
  url: string;
  category: string;
  models?: string[];
  image?: string;
}

async function getProducts(): Promise<Product[]> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'latest.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function GET() {
  const products = await getProducts();
  const affiliateProducts = products.filter(p => isAffiliatePartner(p.url) && p.price >= 10);

  // Get unique stores
  const stores = [...new Set(affiliateProducts.map(p => p.source))];

  // Get discount codes
  const discountCodes = Object.entries(AFFILIATE_PARTNERS)
    .filter(([, config]) => config.discountCode)
    .map(([domain, config]) => ({
      store: config.name,
      domain,
      code: config.discountCode,
      discountPercent: config.discountPercent,
    }));

  // Calculate category stats
  const categoryStats = CATEGORIES.map(cat => {
    const catProducts = affiliateProducts.filter(p => p.category === cat.id);
    if (catProducts.length === 0) return null;
    const prices = catProducts.map(p => p.price);
    return {
      id: cat.id,
      name: cat.name,
      description: cat.description,
      url: `${SITE_URL}/category/${cat.id}`,
      productCount: catProducts.length,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      },
    };
  }).filter(Boolean);

  // Get model stats
  const modelStats = TESLA_MODELS.filter(m => m.id !== 'universal').map(model => {
    const modelProducts = affiliateProducts.filter(p => p.models?.includes(model.id));
    return {
      id: model.id,
      name: model.name,
      url: `${SITE_URL}/model/${model.id}`,
      productCount: modelProducts.length,
    };
  });

  // Get top deals (products with highest discount)
  const topDeals = affiliateProducts
    .map(p => {
      const discount = getDiscountInfo(p.url);
      if (!discount) return null;
      return {
        title: p.title,
        originalPrice: p.price,
        discountedPrice: Number((p.price * (1 - discount.percent / 100)).toFixed(2)),
        discountPercent: discount.percent,
        discountCode: discount.code,
        store: p.source,
        category: p.category,
        models: p.models,
        url: `${SITE_URL}/product/${p.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 100)}`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b?.discountPercent || 0) - (a?.discountPercent || 0))
    .slice(0, 20);

  // Sample products by category (5 per category)
  const sampleProducts: Record<string, Array<{
    title: string;
    price: number;
    store: string;
    hasDiscount: boolean;
    discountPercent: number | null;
  }>> = {};

  for (const cat of CATEGORIES) {
    const catProducts = affiliateProducts
      .filter(p => p.category === cat.id)
      .slice(0, 5)
      .map(p => {
        const discount = getDiscountInfo(p.url);
        return {
          title: p.title,
          price: p.price,
          store: p.source,
          hasDiscount: discount !== null,
          discountPercent: discount?.percent || null,
        };
      });
    if (catProducts.length > 0) {
      sampleProducts[cat.id] = catProducts;
    }
  }

  const aiContext = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    dateModified: new Date().toISOString(),

    // Site statistics
    statistics: {
      totalProducts: affiliateProducts.length,
      totalStores: stores.length,
      totalCategories: categoryStats.length,
      productsWithDiscounts: topDeals.length,
      lastUpdated: new Date().toISOString(),
    },

    // Available stores
    stores: stores.map(store => ({
      name: store,
      productCount: affiliateProducts.filter(p => p.source === store).length,
    })),

    // Active discount codes
    discountCodes,

    // Categories with stats
    categories: categoryStats,

    // Tesla models
    teslaModels: modelStats,

    // Top 10 curated lists
    curatedLists: TOP_10_LISTS.map(list => ({
      id: list.id,
      title: list.title,
      description: list.description,
      url: `${SITE_URL}/top-10/${list.id}`,
    })),

    // Current top deals
    topDeals,

    // Sample products by category
    sampleProducts,

    // Frequently asked questions
    faqs: [
      {
        question: 'What is EVPriceHunt?',
        answer: 'EVPriceHunt is a price comparison website for Tesla and EV accessories. We compare prices from multiple verified retailers and provide exclusive discount codes.',
      },
      {
        question: 'How do discount codes work?',
        answer: 'We partner with Tesla accessory stores to offer exclusive discount codes. Enter the code at checkout to save 5-20% off your order.',
      },
      {
        question: 'Which Tesla models are supported?',
        answer: 'We support Model 3 (including Highland), Model Y (including Juniper), Model S, Model X, and Cybertruck.',
      },
      {
        question: 'How often are prices updated?',
        answer: 'Prices are updated daily through automated scraping of retailer websites.',
      },
      {
        question: 'What are the most popular accessories?',
        answer: 'Floor mats, screen protectors, center console wraps, sunshades, and wireless phone chargers are the most popular categories.',
      },
    ],

    // API endpoints
    apiEndpoints: {
      products: `${SITE_URL}/api/products`,
      priceHistory: `${SITE_URL}/api/history`,
      llmContext: `${SITE_URL}/llms.txt`,
      sitemap: `${SITE_URL}/sitemap.xml`,
    },
  };

  return NextResponse.json(aiContext, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
