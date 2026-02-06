import { MetadataRoute } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { SITE_URL, TESLA_MODELS, CATEGORIES, TOP_10_LISTS, generateSlug } from '@/lib/constants';
import { isAffiliatePartner } from '@/lib/affiliate';

interface Product {
  title: string;
  price: number;
  url: string;
  models?: string[];
  category?: string;
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const affiliateProducts = products.filter(p => isAffiliatePartner(p.url) && p.price >= 10);

  const now = new Date();

  // Static pages — only include lastModified for pages with dynamic data
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/stores`,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/model`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/category`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/top-10`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/compare`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Model pages
  const modelPages: MetadataRoute.Sitemap = TESLA_MODELS
    .filter(m => m.id !== 'universal')
    .map(model => ({
      url: `${SITE_URL}/model/${model.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map(category => ({
    url: `${SITE_URL}/category/${category.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  // Top 10 pages
  const top10Pages: MetadataRoute.Sitemap = TOP_10_LISTS.map(list => ({
    url: `${SITE_URL}/top-10/${list.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Model + Category combination pages
  const modelCategoryPages: MetadataRoute.Sitemap = [];
  for (const model of TESLA_MODELS.filter(m => m.id !== 'universal')) {
    for (const category of CATEGORIES) {
      // Only include if products exist for this combination
      const hasProducts = affiliateProducts.some(
        p => p.models?.includes(model.id) && p.category === category.id
      );
      if (hasProducts) {
        modelCategoryPages.push({
          url: `${SITE_URL}/model/${model.id}/${category.id}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  }

  // Product pages - prioritize affiliate products, limit to 5000 for performance
  const seenSlugs = new Set<string>();
  const productPages: MetadataRoute.Sitemap = affiliateProducts
    .sort((a, b) => b.price - a.price) // Higher price products first
    .slice(0, 5000)
    .filter(product => {
      const slug = generateSlug(product.title);
      if (seenSlugs.has(slug)) return false;
      seenSlugs.add(slug);
      return true;
    })
    .map(product => ({
      url: `${SITE_URL}/product/${generateSlug(product.title)}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
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
