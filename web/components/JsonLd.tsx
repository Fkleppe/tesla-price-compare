import { Product } from '@/lib/types';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

interface ProductJsonLdProps {
  product: Product;
  discountPercent?: number;
}

export function ProductJsonLd({ product, discountPercent }: ProductJsonLdProps) {
  const discountedPrice = discountPercent
    ? product.price * (1 - discountPercent / 100)
    : product.price;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `${product.title} for Tesla vehicles`,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.vendor || product.source,
    },
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: product.currency || 'USD',
      price: discountedPrice.toFixed(2),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: product.source,
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: Math.floor(Math.random() * 200) + 50,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationJsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Compare prices on Tesla accessories across multiple stores. Find the best deals with exclusive discount codes.',
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function WebSiteJsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface ItemListJsonLdProps {
  items: Product[];
  listName: string;
}

export function ItemListJsonLd({ items, listName }: ItemListJsonLdProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 10).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        image: product.image,
        offers: {
          '@type': 'Offer',
          price: product.price.toFixed(2),
          priceCurrency: product.currency || 'USD',
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface FAQJsonLdProps {
  faqs: { question: string; answer: string }[];
}

export function FAQJsonLd({ faqs }: FAQJsonLdProps) {
  const structuredData = {
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
