import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ModelPageClient from './ModelPageClient';
import { TESLA_MODELS, SITE_NAME, SITE_URL } from '@/lib/constants';
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
  return TESLA_MODELS
    .filter(m => m.id !== 'universal')
    .map(model => ({
      slug: model.id,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = TESLA_MODELS.find(m => m.id === slug);

  if (!model) {
    return { title: 'Model Not Found' };
  }

  const title = `Tesla ${model.name} Accessories | Best Prices & Deals | ${SITE_NAME}`;
  const description = `Shop the best accessories for your Tesla ${model.name}. Compare prices, find exclusive discount codes, and save on floor mats, screen protectors, charging accessories, and more.`;

  return {
    title,
    description,
    keywords: [
      `Tesla ${model.name} accessories`,
      `${model.name} floor mats`,
      `${model.name} screen protector`,
      `${model.name} charging accessories`,
      `${model.name} interior`,
      `${model.name} exterior`,
      'Tesla accessories',
      'best price',
      'discount codes',
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/model/${slug}`,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/model/${slug}`,
    },
  };
}

export default async function ModelPage({ params }: Props) {
  const { slug } = await params;
  const model = TESLA_MODELS.find(m => m.id === slug);

  if (!model) {
    notFound();
  }

  const products = await getProducts();

  return (
    <ModelPageClient
      model={model}
      initialProducts={products}
    />
  );
}
