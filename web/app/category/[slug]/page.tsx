import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryPageClient from './CategoryPageClient';
import { CATEGORIES, SITE_NAME, SITE_URL } from '@/lib/constants';
import { promises as fs } from 'fs';
import path from 'path';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProducts() {
  try {
    const dataPath = path.join(process.cwd(), '..', 'data', 'latest.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  return CATEGORIES.map(category => ({
    slug: category.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find(c => c.id === slug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  const title = `${category.name} for Tesla | Best Prices & Deals | ${SITE_NAME}`;
  const description = `${category.description}. Compare prices from top Tesla accessory stores and save with exclusive discount codes.`;

  return {
    title,
    description,
    keywords: [
      category.name,
      'Tesla accessories',
      `Tesla ${category.name.toLowerCase()}`,
      'Tesla Model 3',
      'Tesla Model Y',
      'Tesla Model S',
      'Tesla Model X',
      'Cybertruck accessories',
      'EV accessories',
      'best price',
      'discount codes',
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/category/${slug}`,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = CATEGORIES.find(c => c.id === slug);

  if (!category) {
    notFound();
  }

  const products = await getProducts();

  return (
    <CategoryPageClient
      category={category}
      initialProducts={products}
    />
  );
}
