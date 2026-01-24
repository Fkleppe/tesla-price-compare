import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_URL, SITE_NAME, TOP_10_LISTS, MODEL_LABELS, generateSlug } from '@/lib/constants';
import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/lib/types';
import { isAffiliatePartner, getDiscountInfo, getAffiliateUrl } from '@/lib/affiliate';

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
    keywords: [list.title, ...list.keywords, 'Tesla accessories', 'best Tesla accessories 2026'],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/top-10/${slug}`,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: `${SITE_URL}/top-10/${slug}` },
  };
}

function generateBreadcrumbJsonLd(list: { id: string; title: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Top 10 Lists', item: `${SITE_URL}/top-10` },
      { '@type': 'ListItem', position: 3, name: list.title, item: `${SITE_URL}/top-10/${list.id}` },
    ],
  };
}

function generateTop10FAQJsonLd(list: { id: string; title: string; description: string }) {
  const categoryName = list.title.replace('Best ', '').replace('Tesla ', '');
  const faqs = [
    {
      question: `What are the ${list.title.toLowerCase()} in 2026?`,
      answer: `${list.description} We compare products based on customer reviews, materials, and price.`
    },
    {
      question: `How do you choose the ${categoryName.toLowerCase()} for this list?`,
      answer: `We look at: (1) Customer reviews, (2) Materials and construction, (3) Price, (4) Tesla model compatibility, (5) Discount availability.`
    },
    {
      question: `Are there any discount codes for ${categoryName.toLowerCase()}?`,
      answer: `Yes! Many products have exclusive discount codes that save you 5-20% off. Look for the green "% OFF" badge.`
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

function generateItemListJsonLd(products: Product[], listTitle: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listTitle,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
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

// Get top 10 products for a list
function getTop10Products(products: Product[], list: { keywords: readonly string[] }): Product[] {
  const filtered = products.filter(p => {
    if (!isAffiliatePartner(p.url)) return false;
    const titleLower = p.title.toLowerCase();
    return list.keywords.some(kw => titleLower.includes(kw.toLowerCase()));
  });

  filtered.sort((a, b) => {
    const aDiscount = getDiscountInfo(a.url)?.percent || 0;
    const bDiscount = getDiscountInfo(b.url)?.percent || 0;
    if (bDiscount !== aDiscount) return bDiscount - aDiscount;
    return a.price - b.price;
  });

  return filtered.slice(0, 10);
}

export default async function Top10ListPage({ params }: Props) {
  const { slug } = await params;
  const list = TOP_10_LISTS.find(l => l.id === slug);

  if (!list) {
    notFound();
  }

  const products = await getProducts();
  const topProducts = getTop10Products(products, list);

  const partnerProducts = products.filter(p => isAffiliatePartner(p.url));
  const stats = {
    totalProducts: partnerProducts.length,
    totalStores: new Set(partnerProducts.map(p => p.source)).size,
    discountedCount: partnerProducts.filter(p => getDiscountInfo(p.url) !== null).length,
  };

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(list);
  const faqJsonLd = generateTop10FAQJsonLd(list);
  const itemListJsonLd = generateItemListJsonLd(topProducts, list.title);

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

        <main style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Top 10 Lists', href: '/top-10' },
              { label: list.title },
            ]}
          />

          {/* Hero - SSR */}
          <section style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: 16,
            padding: '48px',
            marginBottom: 32,
            color: '#fff',
          }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, color: '#ffffff' }}>
              {list.title}
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 700, lineHeight: 1.6 }}>
              {list.description}
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600
              }}>
                {topProducts.length} Products Ranked
              </div>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600
              }}>
                Updated January 2026
              </div>
            </div>
          </section>

          <div style={{ display: 'flex', gap: 32 }}>
            {/* Sidebar - Other Lists */}
            <aside style={{ width: 280, flexShrink: 0 }}>
              <div style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                position: 'sticky',
                top: 80,
              }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>All Top 10 Lists</h2>
                </div>
                <div style={{ padding: '8px' }}>
                  {TOP_10_LISTS.map(item => (
                    <Link
                      key={item.id}
                      href={`/top-10/${item.id}`}
                      style={{
                        display: 'block',
                        padding: '12px 16px',
                        borderRadius: 10,
                        background: list.id === item.id ? '#fee2e2' : 'transparent',
                        color: list.id === item.id ? '#dc2626' : '#374151',
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: list.id === item.id ? 600 : 500,
                      }}
                    >
                      {item.title.replace('Best ', '')}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content - Top 10 Products SSR */}
            <div style={{ flex: 1 }}>
              {topProducts.length === 0 ? (
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  border: '1px solid #e5e7eb',
                  padding: '48px',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: 16, color: '#6b7280' }}>
                    No products found in this category. Check back soon!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {topProducts.map((product, index) => {
                    const discount = getDiscountInfo(product.url);
                    const affiliateUrl = getAffiliateUrl(product.url);
                    const discountedPrice = discount
                      ? (product.price * (1 - discount.percent / 100)).toFixed(2)
                      : null;
                    const modelNames = product.models
                      ?.filter(m => m !== 'universal')
                      .map(m => MODEL_LABELS[m] || m)
                      .join(', ') || 'All Tesla Models';

                    return (
                      <article
                        key={index}
                        itemScope
                        itemType="https://schema.org/Product"
                        style={{
                          background: '#fff',
                          borderRadius: 16,
                          border: index === 0 ? '2px solid #fbbf24' : '1px solid #e5e7eb',
                          overflow: 'hidden',
                          display: 'flex',
                          position: 'relative'
                        }}
                      >
                        {/* Rank Badge */}
                        <div style={{
                          position: 'absolute',
                          top: 16,
                          left: 16,
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7f32' : '#e5e7eb',
                          color: index < 3 ? '#fff' : '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                          fontWeight: 800,
                          zIndex: 10,
                        }}>
                          {index + 1}
                        </div>

                        {/* Product Image */}
                        <div style={{ width: 280, flexShrink: 0, background: '#fafafa', position: 'relative' }}>
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.title}
                              itemProp="image"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              loading={index < 3 ? 'eager' : 'lazy'}
                            />
                          )}
                          {discount && (
                            <div style={{
                              position: 'absolute',
                              bottom: 12,
                              right: 12,
                              background: '#16a34a',
                              color: '#fff',
                              padding: '6px 12px',
                              borderRadius: 6,
                              fontSize: 13,
                              fontWeight: 700,
                            }}>
                              {discount.percent}% OFF
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                            {product.source} • {modelNames}
                          </div>
                          <h3
                            itemProp="name"
                            style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 12, lineHeight: 1.3 }}
                          >
                            {product.title}
                          </h3>

                          <div
                            itemProp="offers"
                            itemScope
                            itemType="https://schema.org/Offer"
                            style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}
                          >
                            <meta itemProp="priceCurrency" content="USD" />
                            <link itemProp="availability" href="https://schema.org/InStock" />
                            {discountedPrice ? (
                              <>
                                <span
                                  itemProp="price"
                                  content={discountedPrice}
                                  style={{ fontSize: 28, fontWeight: 800, color: '#16a34a' }}
                                >
                                  ${discountedPrice}
                                </span>
                                <span style={{ fontSize: 18, color: '#9ca3af', textDecoration: 'line-through' }}>
                                  ${product.price.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span
                                itemProp="price"
                                content={product.price.toFixed(2)}
                                style={{ fontSize: 28, fontWeight: 800, color: '#111' }}
                              >
                                ${product.price.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {discount && (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 8,
                              background: '#dcfce7',
                              padding: '8px 14px',
                              borderRadius: 8,
                              marginBottom: 16,
                              width: 'fit-content'
                            }}>
                              <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>
                                Use code:
                              </span>
                              <span style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: '#15803d',
                                fontFamily: 'monospace',
                              }}>
                                {discount.code}
                              </span>
                            </div>
                          )}

                          <div style={{ marginTop: 'auto', display: 'flex', gap: 12 }}>
                            <a
                              href={affiliateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                padding: '12px 24px',
                                background: '#E82127',
                                color: '#fff',
                                borderRadius: 10,
                                fontSize: 14,
                                fontWeight: 700,
                                textDecoration: 'none',
                              }}
                            >
                              Buy at {product.source}
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </a>
                            <Link
                              href={`/product/${generateSlug(product.title)}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 20px',
                                background: '#f3f4f6',
                                color: '#374151',
                                borderRadius: 10,
                                fontSize: 14,
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
