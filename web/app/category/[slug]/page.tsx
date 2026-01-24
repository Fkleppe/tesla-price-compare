import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CategoryPageInteractive from './CategoryPageInteractive';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { CATEGORIES, SITE_NAME, SITE_URL, generateSlug } from '@/lib/constants';
import { promises as fs } from 'fs';
import path from 'path';
import { isAffiliatePartner, getDiscountInfo } from '@/lib/affiliate';
import { Product } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string }>;
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

  const title = `Best Tesla ${category.name} 2026 | Compare Prices & Save`;
  const description = `${category.description}. Compare ${category.name.toLowerCase()} prices from top Tesla accessory stores. Save up to 20% with exclusive discount codes.`;

  return {
    title,
    description,
    keywords: [
      `Tesla ${category.name.toLowerCase()}`,
      `best Tesla ${category.name.toLowerCase()} 2026`,
      `Tesla ${category.name.toLowerCase()} comparison`,
      category.name,
      'Tesla Model 3 accessories',
      'Tesla Model Y accessories',
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: `${SITE_URL}/category` },
      { '@type': 'ListItem', position: 3, name: category.name, item: `${SITE_URL}/category/${category.id}` },
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
      answer: `Tesla ${category.name.toLowerCase()} range from $${lowestPrice.toFixed(0)} to several hundred dollars depending on features and brand. Use our price comparison tool to find the best deals.`
    },
    {
      question: `Are aftermarket ${category.name.toLowerCase()} as good as Tesla OEM?`,
      answer: `Many aftermarket ${category.name.toLowerCase()} are as good as or better than Tesla OEM, often at lower prices. Brands like Tesmanian, Tesery, and 3D MAXpider have good reputations.`
    },
    {
      question: `How do I choose the right ${category.name.toLowerCase()} for my Tesla?`,
      answer: seoContent.buyingTips.join('. ') + '. Always verify compatibility with your specific Tesla model and year.'
    },
    {
      question: `Do you offer discount codes for Tesla ${category.name.toLowerCase()}?`,
      answer: `Yes! We partner with top Tesla accessory stores to offer exclusive discount codes. Many products have codes that save you 5-20% off the regular price.`
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

// Generate ItemList JSON-LD for products
function generateItemListJsonLd(products: Product[], categoryName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryName} for Tesla`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 24).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        image: product.image,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        url: `${SITE_URL}/product/${generateSlug(product.title)}`,
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

  // Filter products for this category
  const categoryProducts = products.filter(p =>
    p.category === category.id && isAffiliatePartner(p.url)
  );

  // Calculate stats
  const productCount = categoryProducts.length;
  const lowestPrice = categoryProducts.length > 0
    ? Math.min(...categoryProducts.map(p => p.price))
    : 50;
  const discountedCount = categoryProducts.filter(p => getDiscountInfo(p.url) !== null).length;
  const partnerProducts = products.filter(p => isAffiliatePartner(p.url));
  const totalStores = new Set(partnerProducts.map(p => p.source)).size;

  // Get first 24 products sorted by price for SSR
  const initialProducts = [...categoryProducts]
    .sort((a, b) => a.price - b.price)
    .slice(0, 24);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(category);
  const faqJsonLd = generateCategoryFAQJsonLd(category, productCount, lowestPrice);
  const itemListJsonLd = generateItemListJsonLd(initialProducts, category.name);
  const seoContent = CATEGORY_SEO[category.id] || CATEGORY_SEO['default'];

  const stats = {
    totalProducts: partnerProducts.length,
    totalStores,
    discountedCount,
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <Header stats={stats} />

        <main style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px' }}>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Categories', href: '/category' },
              { label: category.name },
            ]}
          />

          {/* Hero Section - SSR for SEO */}
          <section style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: 16,
            padding: '48px',
            marginBottom: 32,
            color: '#fff',
          }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
              {category.name} for Tesla
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 600, lineHeight: 1.6 }}>
              {category.description}. Compare prices from {totalStores} stores and find the best deals.
            </p>
            <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{productCount}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Products</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#4ade80' }}>{discountedCount}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>On Sale</div>
              </div>
            </div>
          </section>

          {/* SEO Content Section - SSR */}
          <section style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#111' }}>
              About Tesla {category.name}
            </h2>
            <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, marginBottom: 16 }}>
              {seoContent.longDescription}
            </p>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: '#111' }}>
              Buying Tips
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {seoContent.buyingTips.map((tip, i) => (
                <li key={i} style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
                  {tip}
                </li>
              ))}
            </ul>
          </section>

          {/* First 24 Products - SSR for SEO */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#111' }}>
              Top {category.name} (Lowest Price First)
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16
            }}>
              {initialProducts.map((product, idx) => {
                const discount = getDiscountInfo(product.url);
                return (
                  <Link
                    key={idx}
                    href={`/product/${generateSlug(product.title)}`}
                    style={{
                      background: '#fff',
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    {product.image && (
                      <div style={{ aspectRatio: '4/3', background: '#fafafa', position: 'relative' }}>
                        <img
                          src={product.image}
                          alt={product.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading={idx < 8 ? 'eager' : 'lazy'}
                        />
                        {discount && (
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
                            {discount.percent}% OFF
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ padding: 14 }}>
                      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
                        {product.source}
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
                        {product.title}
                      </h3>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
                        ${product.price.toFixed(0)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Interactive Filters and Full Product List */}
          <CategoryPageInteractive
            category={category}
            initialProducts={products}
          />
        </main>

        <Footer />
      </div>
    </>
  );
}
