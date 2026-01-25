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
}

interface ProductsResult {
  products: Product[];
  lastScrapedAt: Date;
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
    ...productPages,
  ];
}
