import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';
import ProductPageInteractive from './ProductPageInteractive';
import { isAffiliatePartner, getDiscountInfo, getAffiliateUrl } from '../../../lib/affiliate';
import { SITE_URL, generateSlug } from '../../../lib/constants';
import Footer from '../../../components/Footer';

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

// Get all products (filtered: price >= $10)
async function getProducts(): Promise<Product[]> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'latest.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const allProducts: Product[] = JSON.parse(data);
    return allProducts.filter(p => p.price >= 10);
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

// Generate static params for top products only (ISR for the rest)
// Pre-generate affiliate products + top 1000 by price to stay under Vercel limit
export async function generateStaticParams() {
  const products = await getProducts();
  const slugs = new Set<string>();

  // Prioritize affiliate products, then sort rest by price descending
  const sortedProducts = products.sort((a, b) => {
    const aAffiliate = isAffiliatePartner(a.url) ? 1 : 0;
    const bAffiliate = isAffiliatePartner(b.url) ? 1 : 0;
    if (aAffiliate !== bAffiliate) return bAffiliate - aAffiliate;
    return b.price - a.price;
  });

  // Pre-generate top 4000 pages (Vercel has 75MB body limit)
  const MAX_STATIC_PAGES = 4000;

  return sortedProducts
    .filter(p => {
      const slug = generateSlug(p.title);
      if (slugs.has(slug)) return false;
      slugs.add(slug);
      return slugs.size <= MAX_STATIC_PAGES;
    })
    .map(product => ({
      slug: generateSlug(product.title),
    }));
}

// Enable ISR - regenerate pages every hour, generate missing pages on-demand
export const dynamicParams = true;
export const revalidate = 3600;

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

// Category display names
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

function formatCategory(cat: string): string {
  return CATEGORY_NAMES[cat] || cat.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function getModelNames(models: string[]): string {
  if (!models || models.length === 0) return 'All Tesla Models';
  const filtered = models.filter(m => m !== 'universal');
  if (filtered.length === 0) return 'All Tesla Models';
  return filtered.map(m => MODEL_NAMES[m] || m).join(', ');
}

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

  let title = product.title;
  if (title.length > 45) {
    const truncated = title.slice(0, 45);
    const lastSpace = truncated.lastIndexOf(' ');
    title = lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated;
  }
  const fullTitle = `${title} | $${product.price}`;

  let description = '';
  if (discountInfo) {
    description = `${discountInfo.percent}% off with code ${discountInfo.code}. `;
    if (modelNames) {
      description += `Custom-fit ${categoryName.toLowerCase()} for Tesla ${modelNames}. `;
    }
    description += `Only $${(product.price * (1 - discountInfo.percent / 100)).toFixed(0)} at ${product.source}.`;
  } else {
    if (modelNames) {
      description = `${categoryName} for Tesla ${modelNames}. `;
    } else {
      description = `Tesla ${categoryName.toLowerCase()}. `;
    }
    description += `$${product.price.toFixed(0)} at ${product.source}. Compare prices across stores.`;
  }

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

  const modelNames = product.models?.filter(m => m !== 'universal').map(m => MODEL_NAMES[m] || m).join(', ') || 'all Tesla vehicles';
  const categoryName = CATEGORY_NAMES[product.category] || product.category;

  // Generate a proper description
  const description = product.description ||
    `Premium ${categoryName.toLowerCase()} designed specifically for ${modelNames}. ` +
    `High-quality Tesla accessory from ${product.source}. ` +
    `Perfect fit and easy installation. Ships with manufacturer warranty.`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: description,
    image: product.image || undefined,
    sku: `${product.sourceId}-${generateSlug(product.title).slice(0, 20)}`,
    mpn: product.sourceId,
    brand: {
      '@type': 'Brand',
      name: product.vendor || product.source,
    },
    category: categoryName,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${slug}`,
      priceCurrency: 'USD',
      price: discountedPrice,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
        name: formatCategory(product.category),
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
          <Link href="/" style={{ color: '#E82127', marginTop: 16, display: 'inline-block' }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { product, similarProducts } = result;
  const productJsonLd = generateProductJsonLd(product, slug);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(product, slug);

  const discountInfo = getDiscountInfo(product.url);
  const affiliateUrl = getAffiliateUrl(product.url);
  const discountedPrice = discountInfo
    ? (product.price * (1 - discountInfo.percent / 100)).toFixed(2)
    : null;
  const modelNames = getModelNames(product.models);

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

      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        {/* Header - SSR */}
        <header style={{
          background: '#0a0a0a',
          padding: '14px 0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid #222'
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
              EV<span style={{ color: '#E82127' }}>PriceHunt</span>
            </Link>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <Link href="/" style={{ color: '#a3a3a3', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                All Products
              </Link>
              <Link href="/top-10" style={{ color: '#fbbf24', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                Top 10
              </Link>
            </div>
          </div>
        </header>

        {/* Breadcrumb - SSR */}
        <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 0' }} aria-label="Breadcrumb">
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#6b7280' }}>
              <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
              <span aria-hidden="true">›</span>
              <Link href={`/category/${product.category}`} style={{ color: '#6b7280', textDecoration: 'none' }}>
                {formatCategory(product.category)}
              </Link>
              <span aria-hidden="true">›</span>
              <span style={{ color: '#111' }} aria-current="page">{product.title.slice(0, 50)}...</span>
            </div>
          </div>
        </nav>

        {/* Main Content - Critical SEO Section (SSR) */}
        <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
          <article itemScope itemType="https://schema.org/Product">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: 48 }}>

              {/* Left Column - Product Image (SSR) */}
              <div>
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb',
                  marginBottom: 24
                }}>
                  <div style={{ position: 'relative' }}>
                    {product.image ? (
                      <div style={{ aspectRatio: '4/3', background: '#fafafa', position: 'relative' }}>
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                          style={{ objectFit: 'contain', padding: 32 }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        aspectRatio: '4/3',
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af',
                        fontSize: 16
                      }}>
                        No Image Available
                      </div>
                    )}

                    {/* Badges */}
                    <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
                      {discountInfo && (
                        <div style={{
                          background: '#dc2626',
                          color: '#fff',
                          padding: '8px 16px',
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 700
                        }}>
                          {discountInfo.percent}% OFF
                        </div>
                      )}
                      <div style={{
                        background: '#0a0a0a',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600
                      }}>
                        {product.source}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Tabs Component */}
                <ProductPageInteractive
                  product={product}
                  similarProducts={similarProducts}
                />
              </div>

              {/* Right Column - Product Info (SSR) */}
              <div>
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  border: '1px solid #e5e7eb',
                  padding: 28,
                  position: 'sticky',
                  top: 80
                }}>
                  {/* Product Title - Critical for SEO */}
                  <h1
                    itemProp="name"
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      lineHeight: 1.3,
                      marginBottom: 16,
                      color: '#111'
                    }}
                  >
                    {product.title}
                  </h1>

                  {/* Model Compatibility */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 20
                  }}>
                    {product.models?.filter(m => m !== 'universal').map(model => (
                      <span
                        key={model}
                        style={{
                          padding: '6px 12px',
                          background: '#f3f4f6',
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 500,
                          color: '#374151'
                        }}
                      >
                        {MODEL_NAMES[model] || model}
                      </span>
                    ))}
                    <span style={{
                      padding: '6px 12px',
                      background: '#fef3c7',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#92400e'
                    }}>
                      {formatCategory(product.category)}
                    </span>
                  </div>

                  {/* Price Section - Critical for SEO */}
                  <div
                    itemProp="offers"
                    itemScope
                    itemType="https://schema.org/Offer"
                    style={{
                      background: '#f9fafb',
                      borderRadius: 12,
                      padding: 20,
                      marginBottom: 20
                    }}
                  >
                    <meta itemProp="priceCurrency" content="USD" />
                    <link itemProp="availability" href="https://schema.org/InStock" />

                    {discountInfo ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                          <span
                            itemProp="price"
                            content={discountedPrice || ''}
                            style={{ fontSize: 36, fontWeight: 800, color: '#16a34a' }}
                          >
                            ${discountedPrice}
                          </span>
                          <span style={{ fontSize: 20, color: '#9ca3af', textDecoration: 'line-through' }}>
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          background: '#dcfce7',
                          padding: '8px 14px',
                          borderRadius: 8
                        }}>
                          <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>
                            Use code:
                          </span>
                          <span style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#15803d',
                            fontFamily: 'monospace',
                            letterSpacing: '0.05em'
                          }}>
                            {discountInfo.code}
                          </span>
                          <span style={{ fontSize: 13, color: '#16a34a' }}>
                            for {discountInfo.percent}% off
                          </span>
                        </div>
                      </>
                    ) : (
                      <span
                        itemProp="price"
                        content={product.price.toFixed(2)}
                        style={{ fontSize: 36, fontWeight: 800, color: '#111' }}
                      >
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* CTA Button */}
                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '16px 24px',
                      background: '#E82127',
                      color: '#fff',
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 700,
                      textDecoration: 'none',
                      marginBottom: 16
                    }}
                  >
                    Buy at {product.source}
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>

                  {/* Product Description - Important for SEO */}
                  <div itemProp="description" style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>
                      {formatCategory(product.category)} designed for Tesla {modelNames}.
                      Available from {product.source} with fast shipping and easy returns.
                      {discountInfo && ` Save ${discountInfo.percent}% with exclusive discount code ${discountInfo.code}.`}
                    </p>
                  </div>

                  {/* Store Info */}
                  <div style={{
                    marginTop: 24,
                    paddingTop: 20,
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#111' }}>
                      Sold by {product.source}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#6b7280' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#16a34a' }}>✓</span>
                        Free shipping on most orders
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#16a34a' }}>✓</span>
                        30-day return policy
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#16a34a' }}>✓</span>
                        Secure checkout
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Products Section (SSR) */}
            {similarProducts.length > 0 && (
              <section style={{ marginTop: 64 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#111' }}>
                  Similar Products
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 16
                }}>
                  {similarProducts.slice(0, 6).map((p, idx) => {
                    const pDiscount = getDiscountInfo(p.url);
                    return (
                      <Link
                        key={idx}
                        href={`/product/${generateSlug(p.title)}`}
                        style={{
                          background: '#fff',
                          borderRadius: 12,
                          overflow: 'hidden',
                          border: '1px solid #e5e7eb',
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                      >
                        {p.image && (
                          <div style={{ aspectRatio: '4/3', background: '#fafafa', position: 'relative' }}>
                            <Image
                              src={p.image}
                              alt={p.title}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              style={{ objectFit: 'cover' }}
                            />
                            {pDiscount && (
                              <div style={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                background: '#16a34a',
                                color: '#fff',
                                padding: '4px 8px',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 700
                              }}>
                                {pDiscount.percent}% OFF
                              </div>
                            )}
                          </div>
                        )}
                        <div style={{ padding: 14 }}>
                          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
                            {p.source}
                          </div>
                          <h3 style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#111',
                            marginBottom: 8,
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {p.title}
                          </h3>
                          <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
                            ${p.price.toFixed(0)}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}
