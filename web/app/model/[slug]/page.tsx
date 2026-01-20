import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ModelPageClient from './ModelPageClient';
import { TESLA_MODELS, SITE_NAME, SITE_URL } from '@/lib/constants';
import { promises as fs } from 'fs';
import path from 'path';
import { isAffiliatePartner } from '@/lib/affiliate';

interface Props {
  params: Promise<{ slug: string }>;
}

import { Product } from '@/lib/types';

async function getProducts(): Promise<Product[]> {
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

// Model-specific SEO content
const MODEL_SEO: Record<string, { year: string; description: string; popularAccessories: string[] }> = {
  'model-3': {
    year: '2017-2023',
    description: 'The Tesla Model 3 is the best-selling electric car worldwide, and there\'s a huge aftermarket ecosystem of accessories.',
    popularAccessories: ['All-weather floor mats', 'Center console wraps', 'Screen protectors', 'Wireless phone chargers', 'Trunk organizers']
  },
  'highland': {
    year: '2024+',
    description: 'The refreshed Model 3 Highland features a new interior design with updated accessories requirements.',
    popularAccessories: ['Highland-specific floor mats', 'New touchscreen protectors', 'Rear screen protectors', 'Updated center console accessories', 'Ambient lighting upgrades']
  },
  'model-y': {
    year: '2020-2024',
    description: 'The Tesla Model Y is the world\'s best-selling car, combining Model 3 technology with SUV practicality.',
    popularAccessories: ['7-piece floor mat sets', 'Cargo liners', 'Pet barriers', 'Roof rack systems', 'Sunshade sets']
  },
  'juniper': {
    year: '2025+',
    description: 'The refreshed Model Y Juniper brings a new design language and interior updates requiring specific accessories.',
    popularAccessories: ['Juniper-fit floor mats', 'New dashboard screen protectors', 'Updated center console organizers', 'Rear screen protectors', 'Cargo area protection']
  },
  'model-s': {
    year: '2012+',
    description: 'Tesla\'s flagship sedan. The 2021+ refresh added a yoke steering wheel and horizontal screen.',
    popularAccessories: ['Floor mats', 'Yoke steering wheel covers', 'Interior trim', 'Rear screen protectors', 'Center console organizers']
  },
  'model-x': {
    year: '2015+',
    description: 'Tesla\'s SUV with falcon wing doors and 6 or 7 seat configurations.',
    popularAccessories: ['6 or 7 seater floor mats', 'Cargo liners', 'Rear trunk organizers', 'Seat covers', 'Interior lighting']
  },
  'cybertruck': {
    year: '2024+',
    description: 'Tesla\'s pickup truck with stainless steel body. Accessories designed for the bed, frunk, and interior.',
    popularAccessories: ['Bed liners', 'Floor mats', 'Tonneau covers', 'Frunk organizers', 'Exterior protection']
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = TESLA_MODELS.find(m => m.id === slug);

  if (!model) {
    return { title: 'Model Not Found' };
  }

  const modelSeo = MODEL_SEO[slug] || { year: '2020+', description: '', popularAccessories: [] };

  // SEO-optimized title with year
  const title = `Best Tesla ${model.name} Accessories ${modelSeo.year} | Compare & Save`;
  const description = `Shop ${modelSeo.popularAccessories.slice(0, 3).join(', ').toLowerCase()}, and 500+ more accessories for Tesla ${model.name}. Compare prices and save up to 20% with exclusive discount codes.`;

  return {
    title,
    description,
    keywords: [
      `Tesla ${model.name} accessories`,
      `Tesla ${model.name} accessories ${modelSeo.year.split('-')[0]}`,
      `best ${model.name} floor mats`,
      `${model.name} screen protector`,
      `${model.name} charging accessories`,
      `${model.name} interior accessories`,
      `${model.name} exterior accessories`,
      'Tesla accessories',
      'Tesla discount codes',
      'EV accessories',
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

// Generate breadcrumb JSON-LD
function generateBreadcrumbJsonLd(model: { id: string; name: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tesla Models',
        item: `${SITE_URL}/model`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${model.name} Accessories`,
        item: `${SITE_URL}/model/${model.id}`,
      },
    ],
  };
}

// Generate FAQ JSON-LD for model pages
function generateModelFAQJsonLd(model: { id: string; name: string }, productCount: number, lowestPrice: number) {
  const modelSeo = MODEL_SEO[model.id] || MODEL_SEO['model-y'];

  const faqs = [
    {
      question: `What accessories does my Tesla ${model.name} need?`,
      answer: `Common accessories for Tesla ${model.name} include: ${modelSeo.popularAccessories.join(', ')}. ${modelSeo.description}`
    },
    {
      question: `What year Tesla ${model.name} are these accessories for?`,
      answer: `Our ${model.name} accessories are compatible with ${modelSeo.year} model years. Always verify compatibility with your specific production date before purchasing. You can find your build date on the door jamb sticker or in your Tesla app.`
    },
    {
      question: `How much do Tesla ${model.name} accessories cost?`,
      answer: `Tesla ${model.name} accessories start from $${lowestPrice.toFixed(0)}. We compare ${productCount}+ products from trusted retailers to help you find the best prices. Many items have exclusive discount codes that save you up to 20%.`
    },
    {
      question: `Are aftermarket accessories as good as Tesla OEM for ${model.name}?`,
      answer: `Many aftermarket ${model.name} accessories are as good as or better than Tesla OEM. Brands like Tesmanian, Tesery, and 3D MAXpider make products specifically for ${model.name}. They often use similar or better materials at lower prices.`
    },
    {
      question: `How do I find discount codes for Tesla ${model.name} accessories?`,
      answer: `We partner with top Tesla accessory stores to offer exclusive discount codes. Products with available discounts show a green badge with the savings percentage. Simply use the code shown at checkout to save up to 20% on your purchase.`
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export default async function ModelPage({ params }: Props) {
  const { slug } = await params;
  const model = TESLA_MODELS.find(m => m.id === slug);

  if (!model) {
    notFound();
  }

  const products = await getProducts();

  // Calculate stats for FAQ
  const modelProducts = products.filter(p =>
    p.models?.includes(model.id) && isAffiliatePartner(p.url)
  );
  const productCount = modelProducts.length;
  const lowestPrice = modelProducts.length > 0
    ? Math.min(...modelProducts.map(p => p.price))
    : 30;

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(model);
  const faqJsonLd = generateModelFAQJsonLd(model, productCount, lowestPrice);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ModelPageClient
        model={model}
        initialProducts={products}
      />
    </>
  );
}
