import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_NAME, SITE_URL, generateSlug } from '@/lib/constants';
import { promises as fs } from 'fs';
import path from 'path';
import { isAffiliatePartner, getDiscountInfo } from '@/lib/affiliate';
import { Product, ProductMatch } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string }>;
}

interface StoreComparison {
  store1: string;
  store2: string;
  slug: string;
  matches: ProductMatch[];
}

// Store display names and info
const STORE_INFO: Record<string, { name: string; description: string }> = {
  'tesery': { name: 'Tesery', description: 'Wide selection of affordable Tesla accessories' },
  'yeslak': { name: 'Yeslak', description: 'Quality Tesla accessories with competitive pricing' },
  'hansshow': { name: 'Hansshow', description: 'Premium Tesla upgrades and electronics' },
  'jowua': { name: 'JOWUA', description: 'High-end Tesla accessories from Taiwan' },
  'tesmanian': { name: 'Tesmanian', description: 'Popular Tesla accessory retailer' },
  'tesloid': { name: 'Tesloid', description: 'Canadian Tesla accessories store' },
  'shop4tesla': { name: 'Shop4Tesla', description: 'European Tesla accessories' },
  'snuuzu': { name: 'Snuuzu', description: 'Norwegian Tesla accessories' },
  'havnby': { name: 'Havnby', description: 'Scandinavian Tesla accessories' },
};

async function getMatches(): Promise<ProductMatch[]> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'matches.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
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

// Get valid store comparisons
async function getStoreComparisons(): Promise<StoreComparison[]> {
  const matches = await getMatches();
  const affiliateStores = Object.keys(STORE_INFO);

  const isAffiliate = (source: string) =>
    affiliateStores.some(a => source.toLowerCase().includes(a));

  // Find store pairs with matching products
  const pairMap = new Map<string, ProductMatch[]>();

  for (const match of matches) {
    const stores = [...new Set(
      match.products
        .filter(p => isAffiliate(p.source))
        .map(p => {
          // Normalize store name
          for (const key of affiliateStores) {
            if (p.source.toLowerCase().includes(key)) return key;
          }
          return p.source.toLowerCase();
        })
    )].sort();

    if (stores.length >= 2) {
      for (let i = 0; i < stores.length; i++) {
        for (let j = i + 1; j < stores.length; j++) {
          const key = `${stores[i]}-vs-${stores[j]}`;
          if (!pairMap.has(key)) pairMap.set(key, []);
          pairMap.get(key)!.push(match);
        }
      }
    }
  }

  // Convert to array and filter pairs with at least 2 products
  return Array.from(pairMap.entries())
    .filter(([, matches]) => matches.length >= 2)
    .map(([slug, matches]) => {
      const [store1, store2] = slug.split('-vs-');
      return { store1, store2, slug, matches };
    });
}

export async function generateStaticParams() {
  const comparisons = await getStoreComparisons();
  return comparisons.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comparisons = await getStoreComparisons();
  const comparison = comparisons.find(c => c.slug === slug);

  if (!comparison) {
    return { title: 'Comparison Not Found' };
  }

  const store1Info = STORE_INFO[comparison.store1] || { name: comparison.store1 };
  const store2Info = STORE_INFO[comparison.store2] || { name: comparison.store2 };

  const title = `${store1Info.name} vs ${store2Info.name}: Tesla Accessories Price Comparison`;
  const description = `Compare prices between ${store1Info.name} and ${store2Info.name}. See which store offers better deals on ${comparison.matches.length}+ matching Tesla accessories. Find the lowest prices and exclusive discount codes.`;

  return {
    title,
    description,
    keywords: [
      `${store1Info.name} vs ${store2Info.name}`,
      `${comparison.store1} vs ${comparison.store2}`,
      'Tesla accessories comparison',
      'best Tesla accessory store',
      `${store1Info.name} review`,
      `${store2Info.name} review`,
      'Tesla accessories price comparison',
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/compare/${slug}`,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/compare/${slug}`,
    },
  };
}

// Generate breadcrumb JSON-LD
function generateBreadcrumbJsonLd(store1: string, store2: string, slug: string) {
  const s1 = STORE_INFO[store1]?.name || store1;
  const s2 = STORE_INFO[store2]?.name || store2;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Store Comparisons', item: `${SITE_URL}/compare` },
      { '@type': 'ListItem', position: 3, name: `${s1} vs ${s2}`, item: `${SITE_URL}/compare/${slug}` },
    ],
  };
}

// Generate comparison JSON-LD
function generateComparisonJsonLd(
  store1: string,
  store2: string,
  stats: { store1Wins: number; store2Wins: number; avgSavings: number }
) {
  const s1 = STORE_INFO[store1]?.name || store1;
  const s2 = STORE_INFO[store2]?.name || store2;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${s1} vs ${s2} Price Comparison`,
    description: `Compare Tesla accessory prices between ${s1} and ${s2}`,
    mainEntity: {
      '@type': 'ItemList',
      name: 'Store Comparison Results',
      description: `${s1} has better prices on ${stats.store1Wins} products, ${s2} on ${stats.store2Wins} products`,
    },
  };
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const comparisons = await getStoreComparisons();
  const comparison = comparisons.find(c => c.slug === slug);

  if (!comparison) {
    notFound();
  }

  const { store1, store2, matches } = comparison;
  const store1Info = STORE_INFO[store1] || { name: store1, description: '' };
  const store2Info = STORE_INFO[store2] || { name: store2, description: '' };

  const allProducts = await getProducts();
  const affiliateProducts = allProducts.filter(p => isAffiliatePartner(p.url));
  const totalStores = new Set(affiliateProducts.map(p => p.source)).size;

  // Calculate comparison stats
  let store1Wins = 0;
  let store2Wins = 0;
  let totalSavings = 0;

  const comparisonData = matches.map(match => {
    const s1Products = match.products.filter(p =>
      p.source.toLowerCase().includes(store1)
    );
    const s2Products = match.products.filter(p =>
      p.source.toLowerCase().includes(store2)
    );

    const s1Price = s1Products.length > 0 ? Math.min(...s1Products.map(p => p.price)) : null;
    const s2Price = s2Products.length > 0 ? Math.min(...s2Products.map(p => p.price)) : null;

    let winner: string | null = null;
    let savings = 0;

    if (s1Price !== null && s2Price !== null) {
      if (s1Price < s2Price) {
        winner = store1;
        store1Wins++;
        savings = s2Price - s1Price;
      } else if (s2Price < s1Price) {
        winner = store2;
        store2Wins++;
        savings = s1Price - s2Price;
      }
      totalSavings += savings;
    }

    return {
      match,
      s1Price,
      s2Price,
      s1Product: s1Products[0],
      s2Product: s2Products[0],
      winner,
      savings,
    };
  }).sort((a, b) => b.savings - a.savings);

  const avgSavings = comparisonData.length > 0 ? totalSavings / comparisonData.length : 0;

  const discount1 = getDiscountInfo(`https://${store1}.com`);
  const discount2 = getDiscountInfo(`https://${store2}.com`);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(store1, store2, slug);
  const comparisonJsonLd = generateComparisonJsonLd(store1, store2, { store1Wins, store2Wins, avgSavings });

  const stats = {
    totalProducts: affiliateProducts.length,
    totalStores,
    discountedCount: affiliateProducts.filter(p => getDiscountInfo(p.url) !== null).length,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonJsonLd) }}
      />

      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <Header stats={stats} />

        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Compare Stores', href: '/compare' },
              { label: `${store1Info.name} vs ${store2Info.name}` },
            ]}
          />

          {/* Hero Section */}
          <section style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
            borderRadius: 16,
            padding: '48px',
            marginBottom: 32,
            color: '#fff',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                Store Comparison
              </div>
              <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
                {store1Info.name} vs {store2Info.name}
              </h1>
              <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', maxWidth: 600, margin: '0 auto' }}>
                Price comparison on {matches.length} matching Tesla accessories
              </p>
            </div>

            {/* Score Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: 24,
              alignItems: 'center',
              maxWidth: 700,
              margin: '0 auto',
            }}>
              {/* Store 1 */}
              <div style={{
                background: store1Wins > store2Wins ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: 24,
                textAlign: 'center',
                border: store1Wins > store2Wins ? '2px solid #22c55e' : '2px solid transparent',
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{store1Info.name}</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: '#22c55e' }}>{store1Wins}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>lower prices</div>
                {discount1 && (
                  <div style={{
                    marginTop: 12,
                    padding: '6px 12px',
                    background: 'rgba(34, 197, 94, 0.3)',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                  }}>
                    {discount1.percent}% off: {discount1.code}
                  </div>
                )}
              </div>

              {/* VS */}
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
              }}>
                VS
              </div>

              {/* Store 2 */}
              <div style={{
                background: store2Wins > store1Wins ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: 24,
                textAlign: 'center',
                border: store2Wins > store1Wins ? '2px solid #22c55e' : '2px solid transparent',
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{store2Info.name}</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: '#22c55e' }}>{store2Wins}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>lower prices</div>
                {discount2 && (
                  <div style={{
                    marginTop: 12,
                    padding: '6px 12px',
                    background: 'rgba(34, 197, 94, 0.3)',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                  }}>
                    {discount2.percent}% off: {discount2.code}
                  </div>
                )}
              </div>
            </div>

            {/* Summary Stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 32,
              marginTop: 32,
              flexWrap: 'wrap',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{matches.length}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Products Compared</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>${avgSavings.toFixed(0)}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Avg. Price Difference</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>${totalSavings.toFixed(0)}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Total Savings Possible</div>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section style={{
            background: '#fff',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            marginBottom: 32,
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              background: '#f9fafb',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>
                Product-by-Product Comparison
              </h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
                      Product
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
                      {store1Info.name}
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
                      {store2Info.name}
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
                      Winner
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
                      You Save
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        background: idx % 2 === 0 ? '#fff' : '#fafafa',
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {item.s1Product?.image && (
                            <div style={{ width: 48, height: 48, position: 'relative', borderRadius: 6, overflow: 'hidden' }}>
                              <Image
                                src={item.s1Product.image}
                                alt=""
                                fill
                                sizes="48px"
                                style={{ objectFit: 'cover' }}
                              />
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/product/${generateSlug(item.match.products[0].title)}`}
                              style={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#111',
                                textDecoration: 'none',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {item.match.products[0].title}
                            </Link>
                            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                              {item.match.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'right',
                        fontSize: 15,
                        fontWeight: item.winner === store1 ? 700 : 400,
                        color: item.winner === store1 ? '#16a34a' : '#111',
                      }}>
                        {item.s1Price !== null ? `$${item.s1Price.toFixed(0)}` : '—'}
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'right',
                        fontSize: 15,
                        fontWeight: item.winner === store2 ? 700 : 400,
                        color: item.winner === store2 ? '#16a34a' : '#111',
                      }}>
                        {item.s2Price !== null ? `$${item.s2Price.toFixed(0)}` : '—'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {item.winner ? (
                          <span style={{
                            padding: '4px 10px',
                            background: '#dcfce7',
                            color: '#16a34a',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 600,
                          }}>
                            {STORE_INFO[item.winner]?.name || item.winner}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: 13 }}>Tie</span>
                        )}
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'right',
                        fontSize: 15,
                        fontWeight: 600,
                        color: item.savings > 0 ? '#16a34a' : '#9ca3af',
                      }}>
                        {item.savings > 0 ? `$${item.savings.toFixed(0)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SEO Content */}
          <section style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            marginBottom: 48,
            border: '1px solid #e5e7eb',
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#111' }}>
              {store1Info.name} vs {store2Info.name}: Which Store is Better?
            </h2>
            <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, marginBottom: 16 }}>
              We compared {matches.length} identical products available at both {store1Info.name} and {store2Info.name}.
              {store1Wins > store2Wins
                ? ` ${store1Info.name} offers lower prices on ${store1Wins} products, while ${store2Info.name} wins on ${store2Wins} products.`
                : store2Wins > store1Wins
                ? ` ${store2Info.name} offers lower prices on ${store2Wins} products, while ${store1Info.name} wins on ${store1Wins} products.`
                : ` Both stores are evenly matched in price.`}
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#111' }}>
              About the Stores
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, marginBottom: 16 }}>
              <li style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
                <strong>{store1Info.name}:</strong> {store1Info.description}
                {discount1 && ` Use code "${discount1.code}" for ${discount1.percent}% off.`}
              </li>
              <li style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
                <strong>{store2Info.name}:</strong> {store2Info.description}
                {discount2 && ` Use code "${discount2.code}" for ${discount2.percent}% off.`}
              </li>
            </ul>

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#111' }}>
              Tips for Saving Money
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
                Always use discount codes at checkout — they can save you 5-20%
              </li>
              <li style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
                Check both stores for the specific product you need
              </li>
              <li style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
                Consider shipping costs and delivery times for your location
              </li>
            </ul>
          </section>

          {/* Other Comparisons */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>
              Other Store Comparisons
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {comparisons.filter(c => c.slug !== slug).map(c => (
                <Link
                  key={c.slug}
                  href={`/compare/${c.slug}`}
                  style={{
                    padding: '10px 16px',
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#374151',
                    textDecoration: 'none',
                  }}
                >
                  {STORE_INFO[c.store1]?.name || c.store1} vs {STORE_INFO[c.store2]?.name || c.store2}
                </Link>
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
