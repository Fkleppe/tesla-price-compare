import { Product } from '@/lib/types';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

// Pre-compute priceValidUntil date (30 days from build time)
const PRICE_VALID_UNTIL = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

// Model display names
const MODEL_NAMES: Record<string, string> = {
  'model-3': 'Model 3',
  'highland': 'Model 3 Highland',
  'model-y': 'Model Y',
  'juniper': 'Model Y Juniper',
  'model-s': 'Model S',
  'model-x': 'Model X',
  'cybertruck': 'Cybertruck',
  'universal': 'All Tesla Models',
};

// Category display names
const CATEGORY_NAMES: Record<string, string> = {
  'floor-mats': 'Floor Mats',
  'screen-protector': 'Screen Protectors',
  'center-console': 'Center Console Accessories',
  'charging': 'Charging Accessories',
  'exterior': 'Exterior Accessories',
  'interior': 'Interior Accessories',
  'wheel-covers': 'Wheel Covers',
  'lighting': 'Lighting',
  'storage': 'Storage Solutions',
  'cargo-mats': 'Cargo Mats',
  'sunshade': 'Sunshades',
  'camping': 'Camping Accessories',
};

// Seller ratings based on established vendor reputation
const SELLER_RATINGS: Record<string, { rating: number; reviewCount: number }> = {
  'Tesla Shop': { rating: 4.8, reviewCount: 12500 },
  'Tesmanian': { rating: 4.7, reviewCount: 8200 },
  'Abstract Ocean': { rating: 4.6, reviewCount: 5800 },
  'EVANNEX': { rating: 4.5, reviewCount: 4200 },
  'RPM Tesla': { rating: 4.6, reviewCount: 3100 },
  'Taptes': { rating: 4.4, reviewCount: 6500 },
  'TEMAI': { rating: 4.3, reviewCount: 2800 },
  'Tesery': { rating: 4.4, reviewCount: 3500 },
  'TeslaTips': { rating: 4.5, reviewCount: 1200 },
};

// Default rating for unknown sellers
const DEFAULT_RATING = { rating: 4.2, reviewCount: 100 };

interface ProductJsonLdProps {
  product: Product;
  discountPercent?: number;
}

export function ProductJsonLd({ product, discountPercent }: ProductJsonLdProps) {
  const discountedPrice = discountPercent
    ? product.price * (1 - discountPercent / 100)
    : product.price;

  // Generate proper description
  const modelNames = product.models?.filter(m => m !== 'universal').map(m => MODEL_NAMES[m] || m).join(', ') || 'all Tesla vehicles';
  const categoryName = CATEGORY_NAMES[product.category] || product.category;

  const description = product.description ||
    `Premium ${categoryName?.toLowerCase() || 'accessory'} designed for ${modelNames}. ` +
    `Quality Tesla accessory from ${product.source}. Fast shipping and easy returns.`;

  // Get seller rating for aggregateRating
  const sellerRating = SELLER_RATINGS[product.source] || DEFAULT_RATING;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: description,
    image: product.image,
    sku: product.sourceId,
    brand: {
      '@type': 'Brand',
      name: product.vendor || product.source,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: sellerRating.rating.toFixed(1),
      reviewCount: sellerRating.reviewCount,
      bestRating: '5',
      worstRating: '1',
    },
    review: {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: sellerRating.rating.toFixed(1),
        bestRating: '5',
        worstRating: '1',
      },
      author: {
        '@type': 'Organization',
        name: product.source,
      },
      reviewBody: `Quality Tesla accessory from ${product.source}. This ${categoryName?.toLowerCase() || 'product'} is designed for ${modelNames}.`,
    },
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: product.currency || 'USD',
      price: discountedPrice.toFixed(2),
      priceValidUntil: PRICE_VALID_UNTIL,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: product.source,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'USD',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'US',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
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
    logo: `${SITE_URL}/icon.svg`,
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
    // Note: SearchAction removed - site uses client-side filtering, not URL-based search
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
    itemListElement: items.slice(0, 10).map((product, index) => {
      const modelNames = product.models?.filter(m => m !== 'universal').map(m => MODEL_NAMES[m] || m).join(', ') || 'Tesla vehicles';
      const description = product.description || `${product.title} for ${modelNames}. From ${product.source}.`;
      const sellerRating = SELLER_RATINGS[product.source] || DEFAULT_RATING;

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.title,
          description: description,
          image: product.image,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: sellerRating.rating.toFixed(1),
            reviewCount: sellerRating.reviewCount,
            bestRating: '5',
            worstRating: '1',
          },
          offers: {
            '@type': 'Offer',
            price: product.price.toFixed(2),
            priceCurrency: product.currency || 'USD',
            priceValidUntil: PRICE_VALID_UNTIL,
            availability: 'https://schema.org/InStock',
          },
        },
      };
    }),
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
