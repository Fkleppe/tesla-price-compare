import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ModelPageInteractive from './ModelPageInteractive';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { TESLA_MODELS, SITE_NAME, SITE_URL, CATEGORIES, generateSlug } from '@/lib/constants';
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
      'Tesla accessories',
      'Tesla discount codes',
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Tesla Models', item: `${SITE_URL}/model` },
      { '@type': 'ListItem', position: 3, name: `${model.name} Accessories`, item: `${SITE_URL}/model/${model.id}` },
    ],
  };
}

// Generate FAQ JSON-LD
function generateModelFAQJsonLd(model: { id: string; name: string }, productCount: number, lowestPrice: number) {
  const modelSeo = MODEL_SEO[model.id] || MODEL_SEO['model-y'];

  const faqs = [
    {
      question: `What accessories does my Tesla ${model.name} need?`,
      answer: `Common accessories for Tesla ${model.name} include: ${modelSeo.popularAccessories.join(', ')}. ${modelSeo.description}`
    },
    {
      question: `What year Tesla ${model.name} are these accessories for?`,
      answer: `Our ${model.name} accessories are compatible with ${modelSeo.year} model years. Always verify compatibility with your specific production date.`
    },
    {
      question: `How much do Tesla ${model.name} accessories cost?`,
      answer: `Tesla ${model.name} accessories start from $${lowestPrice.toFixed(0)}. We compare ${productCount}+ products from trusted retailers.`
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

// Generate ItemList JSON-LD
function generateItemListJsonLd(products: Product[], modelName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Accessories for Tesla ${modelName}`,
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

export default async function ModelPage({ params }: Props) {
  const { slug } = await params;
  const model = TESLA_MODELS.find(m => m.id === slug);

  if (!model) {
    notFound();
  }

  const products = await getProducts();

  // Filter products for this model
  const modelProducts = products.filter(p =>
    p.models?.includes(model.id) && isAffiliatePartner(p.url)
  );

  // Calculate stats
  const productCount = modelProducts.length;
  const lowestPrice = modelProducts.length > 0
    ? Math.min(...modelProducts.map(p => p.price))
    : 30;
  const discountedCount = modelProducts.filter(p => getDiscountInfo(p.url) !== null).length;
  const partnerProducts = products.filter(p => isAffiliatePartner(p.url));
  const totalStores = new Set(partnerProducts.map(p => p.source)).size;

  // Get first 24 products sorted by price for SSR
  const initialProducts = [...modelProducts]
    .sort((a, b) => a.price - b.price)
    .slice(0, 24);

  // Get available categories for this model
  const availableCategories = CATEGORIES.filter(c =>
    modelProducts.some(p => p.category === c.id)
  ).slice(0, 6);

  const modelSeo = MODEL_SEO[model.id] || MODEL_SEO['model-y'];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(model);
  const faqJsonLd = generateModelFAQJsonLd(model, productCount, lowestPrice);
  const itemListJsonLd = generateItemListJsonLd(initialProducts, model.name);

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
              { label: 'Tesla Models', href: '/model' },
              { label: model.name },
            ]}
          />

          {/* Hero Section - SSR for SEO */}
          <section style={{
            background: 'linear-gradient(135deg, #E82127 0%, #b91c1c 100%)',
            borderRadius: 16,
            padding: '48px',
            marginBottom: 32,
            color: '#fff',
          }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
              Tesla {model.name} Accessories
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', maxWidth: 600, lineHeight: 1.6 }}>
              Find the best accessories specifically designed for your Tesla {model.name}.
              Compare prices and get exclusive discount codes.
            </p>
            <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{productCount}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Products</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{discountedCount}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>On Sale</div>
              </div>
            </div>
          </section>

          {/* Quick Category Links - SSR */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 32,
          }}>
            {availableCategories.map(cat => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}?model=${model.id}`}
                style={{
                  padding: '10px 20px',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#374151',
                  textDecoration: 'none',
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* SEO Content Section - SSR */}
          <section style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#111' }}>
              About Tesla {model.name} Accessories ({modelSeo.year})
            </h2>
            <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, marginBottom: 16 }}>
              {modelSeo.description}
            </p>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: '#111' }}>
              Popular Accessories
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {modelSeo.popularAccessories.map((acc, i) => (
                <li key={i} style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
                  {acc}
                </li>
              ))}
            </ul>
          </section>

          {/* First 24 Products - SSR for SEO */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#111' }}>
              Top {model.name} Accessories (Lowest Price First)
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
          <ModelPageInteractive
            model={model}
            initialProducts={products}
          />
        </main>

        <Footer />
      </div>
    </>
  );
}
