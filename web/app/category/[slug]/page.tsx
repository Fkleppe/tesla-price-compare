import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryPageClient from './CategoryPageClient';
import { CATEGORIES, SITE_NAME, SITE_URL } from '@/lib/constants';
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
  return CATEGORIES.map(category => ({
    slug: category.id,
  }));
}

// Category-specific SEO content
const CATEGORY_SEO: Record<string, { longDescription: string; buyingTips: string[] }> = {
  'floor-mats': {
    longDescription: 'Floor mats protect your Tesla\'s carpet from dirt, water, mud, and daily wear. TPE (thermoplastic elastomer) mats are popular because they\'re odorless, durable, and easier to clean than rubber.',
    buyingTips: ['TPE material is odorless and eco-friendly', 'Check for driver-side retention clips', 'Full sets cost less than buying pieces separately', 'All-weather mats handle snow and rain better']
  },
  'cargo-mats': {
    longDescription: 'Cargo mats protect your Tesla\'s trunk and sub-trunk from spills and scratches. Useful if you carry groceries, pets, or outdoor gear. Custom-fit liners with raised edges catch liquids before they reach the carpet.',
    buyingTips: ['Raised edges contain spills better', 'Consider a set that includes sub-trunk coverage', 'Foldable mats work better with split rear seats', 'Waterproof materials are worth it for outdoor gear']
  },
  'screen-protector': {
    longDescription: 'Screen protectors prevent scratches, fingerprints, and glare on your Tesla\'s touchscreen. 9H tempered glass is the standard for scratch resistance while keeping touch sensitivity.',
    buyingTips: ['9H hardness is the standard for scratch protection', 'Matte finish cuts glare but reduces some clarity', 'Alignment frames make installation easier', 'Oleophobic coating helps with fingerprints']
  },
  'center-console': {
    longDescription: 'Center console accessories cover the surfaces you touch most often. Options include protective wraps, organizer trays, and decorative trim. The piano black finish on older Teslas scratches easily.',
    buyingTips: ['Wraps protect without permanent changes', 'Carbon fiber or wood grain can change the look', 'Organizer trays add practical storage', 'Heat and UV resistant materials last longer']
  },
  'charging': {
    longDescription: 'Most Tesla owners charge at home overnight. Level 2 chargers (240V) add 30-44 miles of range per hour, which fully charges most Teslas in 8-10 hours.',
    buyingTips: ['48A chargers are the fastest for home use', 'Make sure cable length works for your parking spot', 'UL-listed chargers are tested for safety', 'Smart chargers let you schedule off-peak charging']
  },
  'default': {
    longDescription: 'Tesla aftermarket accessories can protect your car and add features Tesla doesn\'t offer. Products designed for specific Tesla models fit better than universal accessories.',
    buyingTips: ['Check compatibility with your Tesla model and year', 'Read reviews from other Tesla owners', 'Check return policies before buying', 'Compare prices across stores']
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find(c => c.id === slug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  // More SEO-optimized title with year
  const title = `Best Tesla ${category.name} 2025 | Compare Prices & Save`;
  const description = `${category.description}. Compare ${category.name.toLowerCase()} prices from top Tesla accessory stores. Save up to 20% with exclusive discount codes.`;

  return {
    title,
    description,
    keywords: [
      `Tesla ${category.name.toLowerCase()}`,
      `best Tesla ${category.name.toLowerCase()} 2025`,
      `Tesla ${category.name.toLowerCase()} comparison`,
      category.name,
      'Tesla Model 3 accessories',
      'Tesla Model Y accessories',
      'Tesla Model S accessories',
      'Tesla Model X accessories',
      'Cybertruck accessories',
      'Tesla accessory deals',
      'Tesla discount codes',
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

// Generate breadcrumb JSON-LD
function generateBreadcrumbJsonLd(category: { id: string; name: string }) {
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
        name: 'Categories',
        item: `${SITE_URL}/category`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `${SITE_URL}/category/${category.id}`,
      },
    ],
  };
}

// Generate FAQ JSON-LD for category
function generateCategoryFAQJsonLd(category: { id: string; name: string; description: string }, productCount: number, lowestPrice: number) {
  const seoContent = CATEGORY_SEO[category.id] || CATEGORY_SEO['default'];

  const faqs = [
    {
      question: `What are the best ${category.name.toLowerCase()} for Tesla?`,
      answer: `${seoContent.longDescription} We compare ${productCount}+ ${category.name.toLowerCase()} from trusted retailers to help you find the best option for your Tesla.`
    },
    {
      question: `How much do Tesla ${category.name.toLowerCase()} cost?`,
      answer: `Tesla ${category.name.toLowerCase()} range from $${lowestPrice.toFixed(0)} to several hundred dollars depending on features and brand. Use our price comparison tool to find the best deals across multiple stores.`
    },
    {
      question: `Are aftermarket ${category.name.toLowerCase()} as good as Tesla OEM?`,
      answer: `Many aftermarket ${category.name.toLowerCase()} are as good as or better than Tesla OEM, often at lower prices. Brands like Tesmanian, Tesery, and 3D MAXpider have good reputations among Tesla owners for fit and durability.`
    },
    {
      question: `How do I choose the right ${category.name.toLowerCase()} for my Tesla?`,
      answer: seoContent.buyingTips.join('. ') + '. Always verify compatibility with your specific Tesla model and year before purchasing.'
    },
    {
      question: `Do you offer discount codes for Tesla ${category.name.toLowerCase()}?`,
      answer: `Yes! We partner with top Tesla accessory stores to offer exclusive discount codes. Many products on our site have codes that save you 5-20% off the regular price. Look for the green discount badge on products.`
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

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = CATEGORIES.find(c => c.id === slug);

  if (!category) {
    notFound();
  }

  const products = await getProducts();

  // Calculate stats for FAQ
  const categoryProducts = products.filter(p =>
    p.category === category.id && isAffiliatePartner(p.url)
  );
  const productCount = categoryProducts.length;
  const lowestPrice = categoryProducts.length > 0
    ? Math.min(...categoryProducts.map(p => p.price))
    : 50;

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(category);
  const faqJsonLd = generateCategoryFAQJsonLd(category, productCount, lowestPrice);

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
      <CategoryPageClient
        category={category}
        initialProducts={products}
      />
    </>
  );
}
