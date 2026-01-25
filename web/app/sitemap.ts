import { MetadataRoute } from 'next';
import { TESLA_MODELS, CATEGORIES, TOP_10_LISTS, generateSlug, SITE_URL } from '@/lib/constants';
import { isAffiliatePartner } from '@/lib/affiliate';
import { promises as fs } from 'fs';
import path from 'path';

interface Product {
  title: string;
  url: string;
  scrapedAt?: string;
  models?: string[];
  category?: string;
  source?: string;
}

interface ProductMatch {
  products: { source: string }[];
}

interface ProductsResult {
  products: Product[];
  lastScrapedAt: Date;
}

const AFFILIATE_STORES = ['tesery', 'yeslak', 'hansshow', 'jowua', 'tesmanian', 'tesloid', 'shop4tesla', 'snuuzu', 'havnby'];

async function getMatches(): Promise<ProductMatch[]> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'matches.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function getStoreComparisonSlugs(matches: ProductMatch[]): string[] {
  const isAffiliate = (source: string) =>
    AFFILIATE_STORES.some(a => source.toLowerCase().includes(a));

  const pairMap = new Map<string, number>();

  for (const match of matches) {
    const stores = [...new Set(
      match.products
        .filter(p => isAffiliate(p.source))
        .map(p => {
          for (const key of AFFILIATE_STORES) {
            if (p.source.toLowerCase().includes(key)) return key;
          }
          return p.source.toLowerCase();
        })
    )].sort();

    if (stores.length >= 2) {
      for (let i = 0; i < stores.length; i++) {
        for (let j = i + 1; j < stores.length; j++) {
          const key = `${stores[i]}-vs-${stores[j]}`;
          pairMap.set(key, (pairMap.get(key) || 0) + 1);
        }
      }
    }
  }

  return Array.from(pairMap.entries())
    .filter(([, count]) => count >= 2)
    .map(([slug]) => slug);
}

async function getProducts(): Promise<ProductsResult> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'latest.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const products: Product[] = JSON.parse(data);

    // Find the most recent scrape date
    const scrapeDates = products
      .filter(p => p.scrapedAt)
      .map(p => new Date(p.scrapedAt!).getTime());
    const lastScrapedAt = scrapeDates.length > 0
      ? new Date(Math.max(...scrapeDates))
      : new Date();

    return { products, lastScrapedAt };
  } catch {
    return { products: [], lastScrapedAt: new Date() };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, lastScrapedAt } = await getProducts();
  const baseUrl = SITE_URL;

  // Static pages - use last scrape date for dynamic content pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: lastScrapedAt,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2025-01-20'), // Static content - set manually
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/top-10`,
      lastModified: lastScrapedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/stores`,
      lastModified: lastScrapedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/model`,
      lastModified: lastScrapedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/category`,
      lastModified: lastScrapedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2025-01-14'), // Static content - set manually
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2025-01-14'), // Static content - set manually
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // AI/LLM context files for GEO
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: lastScrapedAt,
      changeFrequency: 'daily',
      priority: 0.5,
    },
  ];

  // Model pages
  const modelPages: MetadataRoute.Sitemap = TESLA_MODELS
    .filter(m => m.id !== 'universal')
    .map(model => ({
      url: `${baseUrl}/model/${model.id}`,
      lastModified: lastScrapedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map(category => ({
    url: `${baseUrl}/category/${category.id}`,
    lastModified: lastScrapedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Top 10 list pages (clean URLs)
  const top10Pages: MetadataRoute.Sitemap = TOP_10_LISTS.map(list => ({
    url: `${baseUrl}/top-10/${list.id}`,
    lastModified: lastScrapedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Model + Category combination pages (pSEO)
  const affiliateProducts = products.filter(p => isAffiliatePartner(p.url));
  const modelCategoryPages: MetadataRoute.Sitemap = [];

  for (const model of TESLA_MODELS.filter(m => m.id !== 'universal')) {
    for (const category of CATEGORIES) {
      const hasProducts = affiliateProducts.some(
        p => p.models?.includes(model.id) && p.category === category.id
      );
      if (hasProducts) {
        modelCategoryPages.push({
          url: `${baseUrl}/model/${model.id}/${category.id}`,
          lastModified: lastScrapedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.75,
        });
      }
    }
  }

  // Store comparison pages
  const matches = await getMatches();
  const comparisonSlugs = getStoreComparisonSlugs(matches);
  const comparePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/compare`,
      lastModified: lastScrapedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...comparisonSlugs.map(slug => ({
      url: `${baseUrl}/compare/${slug}`,
      lastModified: lastScrapedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];

  // Product pages (limit to first 5000 for sitemap size)
  // Use each product's actual scrape date for accurate lastModified
  const productPages: MetadataRoute.Sitemap = products.slice(0, 5000).map(product => ({
    url: `${baseUrl}/product/${generateSlug(product.title)}`,
    lastModified: product.scrapedAt ? new Date(product.scrapedAt) : lastScrapedAt,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...modelPages,
    ...categoryPages,
    ...top10Pages,
    ...modelCategoryPages,
    ...comparePages,
    ...productPages,
  ];
}
