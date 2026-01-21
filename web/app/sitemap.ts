import { MetadataRoute } from 'next';
import { TESLA_MODELS, CATEGORIES, TOP_10_LISTS, generateSlug, SITE_URL } from '@/lib/constants';
import { promises as fs } from 'fs';
import path from 'path';

interface Product {
  title: string;
  url: string;
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
  const baseUrl = SITE_URL;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/top-10`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/stores`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/model`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/category`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Model pages
  const modelPages: MetadataRoute.Sitemap = TESLA_MODELS
    .filter(m => m.id !== 'universal')
    .map(model => ({
      url: `${baseUrl}/model/${model.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map(category => ({
    url: `${baseUrl}/category/${category.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Top 10 list pages (clean URLs)
  const top10Pages: MetadataRoute.Sitemap = TOP_10_LISTS.map(list => ({
    url: `${baseUrl}/top-10/${list.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Product pages (limit to first 5000 for sitemap size)
  const productPages: MetadataRoute.Sitemap = products.slice(0, 5000).map(product => ({
    url: `${baseUrl}/product/${generateSlug(product.title)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...modelPages,
    ...categoryPages,
    ...top10Pages,
    ...productPages,
  ];
}
