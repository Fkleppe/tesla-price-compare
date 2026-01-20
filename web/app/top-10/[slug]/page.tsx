import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Top10ListClient from './Top10ListClient';
import { SITE_URL, SITE_NAME, TOP_10_LISTS } from '@/lib/constants';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return TOP_10_LISTS.map(list => ({
    slug: list.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const list = TOP_10_LISTS.find(l => l.id === slug);

  if (!list) {
    return { title: 'List Not Found' };
  }

  const title = `${list.title} 2026 | Top 10 Tesla Accessories`;
  const description = `${list.description} Compare prices from trusted retailers and save with exclusive discount codes. Updated for 2026.`;

  return {
    title,
    description,
    keywords: [
      list.title,
      ...list.keywords,
      'Tesla accessories',
      'best Tesla accessories 2026',
      'Tesla comparison',
      'discount codes',
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/top-10/${slug}`,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/top-10/${slug}`,
    },
  };
}

// Generate breadcrumb JSON-LD
function generateBreadcrumbJsonLd(list: { id: string; title: string }) {
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
        name: 'Top 10 Lists',
        item: `${SITE_URL}/top-10`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: list.title,
        item: `${SITE_URL}/top-10/${list.id}`,
      },
    ],
  };
}

// Generate FAQ JSON-LD for top-10 list
function generateTop10FAQJsonLd(list: { id: string; title: string; description: string; keywords: readonly string[] }) {
  const categoryName = list.title.replace('Best ', '').replace('Tesla ', '');

  const faqs = [
    {
      question: `What are the ${list.title.toLowerCase()} in 2026?`,
      answer: `${list.description} We compare products based on customer reviews, materials, and price. This list is updated monthly.`
    },
    {
      question: `How do you choose the ${categoryName.toLowerCase()} for this list?`,
      answer: `We look at: (1) Customer reviews from verified buyers, (2) Materials and construction, (3) Price compared to similar products, (4) Which Tesla models they fit, (5) Whether discount codes are available.`
    },
    {
      question: `Are there any discount codes for ${categoryName.toLowerCase()}?`,
      answer: `Yes! Many products in our top 10 list have exclusive discount codes that save you 5-20% off the regular price. Look for the green "% OFF" badge on each product. Simply use the code shown at checkout.`
    },
    {
      question: `Which Tesla models are these ${categoryName.toLowerCase()} compatible with?`,
      answer: `Our list includes ${categoryName.toLowerCase()} compatible with all Tesla models: Model 3, Model 3 Highland, Model Y, Model Y Juniper, Model S, Model X, and Cybertruck. Check each product listing for specific model compatibility.`
    },
    {
      question: `How often is this ${categoryName.toLowerCase()} list updated?`,
      answer: `We update our top 10 lists monthly to reflect new products, price changes, and customer feedback. This list was last updated in January 2026. Prices and availability are checked daily.`
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

export default async function Top10ListPage({ params }: Props) {
  const { slug } = await params;
  const list = TOP_10_LISTS.find(l => l.id === slug);

  if (!list) {
    notFound();
  }

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(list);
  const faqJsonLd = generateTop10FAQJsonLd(list);

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
      <Top10ListClient list={list} />
    </>
  );
}
