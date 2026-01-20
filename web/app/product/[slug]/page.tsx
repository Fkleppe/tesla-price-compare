import { Metadata } from 'next';
import fs from 'fs/promises';
import path from 'path';
import ProductPageClient from './ProductPageClient';
import { isAffiliatePartner, getDiscountInfo } from '../../../lib/affiliate';
import { SITE_URL } from '../../../lib/constants';

interface Product {
  title: string;
  price: number;
  currency: string;
  url: string;
  image: string;
  source: string;
  sourceId: string;
  category: string;
  models: string[];
  description?: string;
  vendor?: string;
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

// Get all products (filtered: price >= $10, affiliate partners only)
async function getProducts(): Promise<Product[]> {
  try {
    const dataPath = path.join(process.cwd(), '..', 'data', 'latest.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const allProducts: Product[] = JSON.parse(data);
    return allProducts.filter(p => p.price >= 10 && isAffiliatePartner(p.url));
  } catch {
    return [];
  }
}

// Find product by slug
async function getProductBySlug(slug: string): Promise<{ product: Product; similarProducts: Product[] } | null> {
  const products = await getProducts();

  const product = products.find(p => generateSlug(p.title) === slug);
  if (!product) return null;

  // Find similar products (same category and model)
  const similarProducts = products
    .filter(p =>
      p.title !== product.title &&
      (p.category === product.category ||
       p.models?.some(m => product.models?.includes(m)))
    )
    .slice(0, 12);

  return { product, similarProducts };
}

// Generate static params for all products
export async function generateStaticParams() {
  const products = await getProducts();
  const slugs = new Set<string>();

  return products
    .filter(p => {
      const slug = generateSlug(p.title);
      if (slugs.has(slug)) return false;
      slugs.add(slug);
      return true;
    })
    .map(product => ({
      slug: generateSlug(product.title),
    }));
}

// Model display names for SEO
const MODEL_NAMES: Record<string, string> = {
  'model-3': 'Model 3',
  'highland': 'Model 3 Highland',
  'model-y': 'Model Y',
  'juniper': 'Model Y Juniper',
  'model-s': 'Model S',
  'model-x': 'Model X',
  'cybertruck': 'Cybertruck',
  'universal': 'Universal',
};

// Category display names - comprehensive list matching all product categories
const CATEGORY_NAMES: Record<string, string> = {
  'floor-mats': 'Floor Mats',
  'screen-protector': 'Screen Protectors',
  'screen-protectors': 'Screen Protectors',
  'center-console': 'Center Console Accessories',
  'charging': 'Charging Accessories',
  'charger': 'Charging Accessories',
  'exterior': 'Exterior Accessories',
  'interior': 'Interior Accessories',
  'interior-trim': 'Interior Trim',
  'wheels': 'Wheels & Tires',
  'wheel-covers': 'Wheel Covers',
  'lighting': 'Lighting Accessories',
  'storage': 'Storage Solutions',
  'cargo-mats': 'Cargo Mats & Liners',
  'seat-covers': 'Seat Covers',
  'sunshade': 'Sunshades',
  'camping': 'Camping Accessories',
  'electronics': 'Electronic Accessories',
  'vent-cover': 'Vent Covers',
  'mud-flaps': 'Mud Flaps',
  'door-sill': 'Door Sill Protectors',
  'phone-mount': 'Phone Mounts',
  'wireless-charger': 'Wireless Chargers',
  'cup-holder': 'Cup Holder Accessories',
  'pedals': 'Pedal Covers',
  'steering-wheel': 'Steering Wheel Accessories',
  'frunk': 'Frunk Accessories',
  'door-seal': 'Door Seals',
  'carbon-fiber': 'Carbon Fiber Accessories',
  'spoiler': 'Spoilers',
  'headrest': 'Headrest Accessories',
  'refrigerator': 'Portable Refrigerators',
  'power-adapter': 'Power Adapters',
  'trunk-organizer': 'Trunk Organizers',
  'dashcam': 'Dash Cameras',
  'key-fob': 'Key Fob Accessories',
  'pet-accessories': 'Pet Accessories',
  'other': 'Tesla Accessories',
};

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result) {
    return {
      title: 'Product Not Found | EVPriceHunt',
      description: 'The product you are looking for could not be found.',
    };
  }

  const { product } = result;
  const discountInfo = getDiscountInfo(product.url);
  const models = product.models?.filter(m => m !== 'universal') || [];
  const modelNames = models.map(m => MODEL_NAMES[m] || m).join(' & ');
  const categoryName = CATEGORY_NAMES[product.category] || product.category;

  // Create concise, keyword-rich title (under 60 chars ideally)
  // Note: Layout template will append "| EVPriceHunt" automatically
  let title = product.title;
  if (title.length > 45) {
    // Cut at word boundary
    const truncated = title.slice(0, 45);
    const lastSpace = truncated.lastIndexOf(' ');
    title = lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated;
  }
  const fullTitle = `${title} | $${product.price}`;

  // Create compelling meta description (under 160 chars)
  // Focus on value proposition, compatibility, and call-to-action
  let description = '';

  if (discountInfo) {
    // Lead with discount for products with codes
    description = `${discountInfo.percent}% off with code ${discountInfo.code}. `;
    if (modelNames) {
      description += `Custom-fit ${categoryName.toLowerCase()} for Tesla ${modelNames}. `;
    }
    description += `Only $${(product.price * (1 - discountInfo.percent / 100)).toFixed(0)} at ${product.source}.`;
  } else {
    // Lead with product info for regular products
    if (modelNames) {
      description = `${categoryName} for Tesla ${modelNames}. `;
    } else {
      description = `Tesla ${categoryName.toLowerCase()}. `;
    }
    description += `$${product.price.toFixed(0)} at ${product.source}. Compare prices across stores.`;
  }

  // Ensure description is under 155 chars and ends properly
  if (description.length > 155) {
    const truncated = description.slice(0, 150);
    const lastSpace = truncated.lastIndexOf(' ');
    description = lastSpace > 100 ? truncated.slice(0, lastSpace) + '.' : truncated + '...';
  }

  return {
    title: fullTitle,
    description,
    keywords: [
      product.title,
      `Tesla ${categoryName}`,
      ...models.map(m => `Tesla ${MODEL_NAMES[m] || m} accessories`),
      `${product.source} Tesla`,
      'Tesla accessories',
      'Tesla aftermarket parts',
    ].join(', '),
    openGraph: {
      title: product.title,
      description,
      images: product.image ? [{ url: product.image, width: 800, height: 600, alt: product.title }] : [],
      type: 'website',
      siteName: 'EVPriceHunt',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: product.image ? [product.image] : [],
    },
    alternates: {
      canonical: `${SITE_URL}/product/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Generate JSON-LD structured data for product
function generateProductJsonLd(product: Product, slug: string) {
  const discountInfo = getDiscountInfo(product.url);
  const discountedPrice = discountInfo
    ? (product.price * (1 - discountInfo.percent / 100)).toFixed(2)
    : product.price.toFixed(2);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: `${product.title} for Tesla ${product.models?.filter(m => m !== 'universal').join(', ') || 'vehicles'}. From ${product.source}.`,
    image: product.image || undefined,
    brand: {
      '@type': 'Brand',
      name: product.vendor || product.source,
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${slug}`,
      priceCurrency: 'USD',
      price: discountedPrice,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: product.source,
      },
    },
  };
}

// Generate breadcrumb JSON-LD
function generateBreadcrumbJsonLd(product: Product, slug: string) {
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
        name: formatCategoryName(product.category),
        item: `${SITE_URL}/category/${product.category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `${SITE_URL}/product/${slug}`,
      },
    ],
  };
}

function formatCategoryName(category: string): string {
  return category.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Store info for FAQ answers
const STORE_INFO: Record<string, { shipping: string; returns: string; established: string }> = {
  'Tesery': { shipping: 'Free shipping over $49', returns: '30-day returns', established: '2018' },
  'Yeslak': { shipping: 'Free shipping over $59', returns: '30-day returns', established: '2019' },
  'Jowua': { shipping: 'Free worldwide shipping', returns: '14-day returns', established: '2017' },
  'Hansshow': { shipping: 'Free shipping over $99', returns: '30-day returns', established: '2016' },
  'Tesmanian': { shipping: 'Free shipping over $100', returns: '30-day returns', established: '2019' },
  'TAPTES': { shipping: 'Free shipping over $69', returns: '30-day returns', established: '2018' },
  'EVBASE': { shipping: 'Free shipping over $79', returns: '30-day returns', established: '2020' },
  'Shop4Tesla': { shipping: 'EU warehouse available', returns: '14-day returns', established: '2019' },
  'default': { shipping: 'Standard shipping rates apply', returns: '30-day returns', established: '2018' },
};

// Model years for FAQ
const MODEL_YEARS: Record<string, string> = {
  'model-3': '2017-2023',
  'highland': '2024+',
  'model-y': '2020-2024',
  'juniper': '2025+',
  'model-s': '2012+',
  'model-x': '2015+',
  'cybertruck': '2024+',
  'universal': 'All Years',
};

// Generate FAQ JSON-LD with 10 comprehensive questions
function generateFAQJsonLd(product: Product) {
  const discountInfo = getDiscountInfo(product.url);
  const models = product.models?.filter(m => m !== 'universal') || [];
  const modelNames = models.map(m => MODEL_NAMES[m] || m).join(', ') || 'All Tesla Models';
  const modelYears = models.map(m => MODEL_YEARS[m] || 'All Years').join(', ') || 'All Years';
  const storeInfo = STORE_INFO[product.source] || STORE_INFO['default'];
  const categoryName = formatCategoryName(product.category);

  const faqs = [
    {
      question: `Is this ${categoryName.toLowerCase()} compatible with my Tesla?`,
      answer: `This product is specifically designed for Tesla ${modelNames}, fitting model years ${modelYears}. Before ordering, verify your Tesla's model year by checking the vehicle identification plate or your Tesla app to ensure compatibility.`
    },
    {
      question: `How do I install the ${product.title}?`,
      answer: `Installation is straightforward and typically takes 10-30 minutes depending on the product type. Most Tesla accessories are designed for DIY installation with no special tools required. Detailed step-by-step instructions are included with your purchase.`
    },
    {
      question: `How do I get the best price on this ${categoryName.toLowerCase()}?`,
      answer: discountInfo
        ? `Use the exclusive discount code "${discountInfo.code}" at checkout on ${product.source} to save ${discountInfo.percent}% off the regular price of $${product.price.toFixed(2)}. This brings your final price to just $${(product.price * (1 - discountInfo.percent / 100)).toFixed(2)}.`
        : `The current price at ${product.source} is $${product.price.toFixed(2)}. Check EVPriceHunt regularly for exclusive discount codes and seasonal promotions. Signing up for the retailer's newsletter may also unlock first-time buyer discounts.`
    },
    {
      question: `What is ${product.source}'s return policy?`,
      answer: `${product.source} offers ${storeInfo.returns} for items in original, unused condition with all packaging intact. To initiate a return, contact ${product.source} customer service with your order number. Refunds are typically processed within 5-7 business days after the return is received.`
    },
    {
      question: `How long does shipping take from ${product.source}?`,
      answer: `${storeInfo.shipping}. Orders are typically processed within 1-3 business days. Standard delivery takes 5-10 business days depending on your location. Expedited shipping options may be available at checkout. International shipping is available to most countries.`
    },
    {
      question: `What materials is this ${categoryName.toLowerCase()} made from?`,
      answer: `Materials depend on the product type. Common materials include TPE (floor mats), ABS plastic (trim pieces), tempered glass (screen protectors), and various fabrics. Check the ${product.source} product page for specific materials used in this product.`
    },
    {
      question: `Does this product come with a warranty?`,
      answer: `Products from ${product.source} are covered by their standard manufacturer warranty, protecting against defects in materials and workmanship. For warranty claims, contact ${product.source} customer service with your order details. ${product.source} has been a trusted Tesla accessories seller since ${storeInfo.established}.`
    },
    {
      question: `How do I care for and maintain this ${categoryName.toLowerCase()}?`,
      answer: `For best results, follow the manufacturer's care instructions included with your product. Generally, clean with mild soap and water, avoid harsh chemicals, and inspect regularly for wear. Proper maintenance will extend the life of your accessory and keep it looking new.`
    },
    {
      question: `Is this an official Tesla product?`,
      answer: `This is an aftermarket accessory from ${product.vendor || product.source}, not an official Tesla product. Many aftermarket products are designed specifically for Tesla and can be similar or better than OEM at lower prices.`
    },
    {
      question: `What if this product doesn't fit my Tesla?`,
      answer: `If the product doesn't fit correctly, ${product.source} offers ${storeInfo.returns}. Before installing, always do a test fit to verify compatibility. If you have fitment issues, contact ${product.source} customer service—they may be able to help troubleshoot or offer an exchange for the correct variant.`
    }
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

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Product Not Found</h1>
          <p style={{ color: '#737373' }}>The product you are looking for could not be found.</p>
          <a href="/" style={{ color: '#E82127', marginTop: 16, display: 'inline-block' }}>
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const productJsonLd = generateProductJsonLd(result.product, slug);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(result.product, slug);
  const faqJsonLd = generateFAQJsonLd(result.product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ProductPageClient product={result.product} similarProducts={result.similarProducts} />
    </>
  );
}
