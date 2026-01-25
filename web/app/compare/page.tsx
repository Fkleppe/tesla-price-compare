import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { promises as fs } from 'fs';
import path from 'path';
import { isAffiliatePartner, getDiscountInfo } from '@/lib/affiliate';
import { Product, ProductMatch } from '@/lib/types';

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

interface StoreComparison {
  store1: string;
  store2: string;
  slug: string;
  matchCount: number;
}

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

async function getStoreComparisons(): Promise<StoreComparison[]> {
  const matches = await getMatches();
  const affiliateStores = Object.keys(STORE_INFO);

  const isAffiliate = (source: string) =>
    affiliateStores.some(a => source.toLowerCase().includes(a));

  const pairMap = new Map<string, number>();

  for (const match of matches) {
    const stores = [...new Set(
      match.products
        .filter(p => isAffiliate(p.source))
        .map(p => {
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
          pairMap.set(key, (pairMap.get(key) || 0) + 1);
        }
      }
    }
  }

  return Array.from(pairMap.entries())
    .filter(([, count]) => count >= 2)
    .map(([slug, count]) => {
      const [store1, store2] = slug.split('-vs-');
      return { store1, store2, slug, matchCount: count };
    })
    .sort((a, b) => b.matchCount - a.matchCount);
}

export const metadata: Metadata = {
  title: 'Compare Tesla Accessory Stores | Price Comparison',
  description: 'Compare prices between popular Tesla accessory stores. Find out which store offers better deals on floor mats, screen protectors, and more.',
  keywords: [
    'Tesla accessory stores comparison',
    'Tesery vs Yeslak',
    'best Tesla accessories store',
    'Tesla accessories price comparison',
    'cheapest Tesla accessories',
  ],
  openGraph: {
    title: 'Compare Tesla Accessory Stores | Price Comparison',
    description: 'Compare prices between popular Tesla accessory stores.',
    url: `${SITE_URL}/compare`,
    siteName: SITE_NAME,
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_URL}/compare`,
  },
};

export default async function ComparePage() {
  const comparisons = await getStoreComparisons();
  const products = await getProducts();
  const affiliateProducts = products.filter(p => isAffiliatePartner(p.url));
  const totalStores = new Set(affiliateProducts.map(p => p.source)).size;

  const stats = {
    totalProducts: affiliateProducts.length,
    totalStores,
    discountedCount: affiliateProducts.filter(p => getDiscountInfo(p.url) !== null).length,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Header stats={stats} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Compare Stores' },
          ]}
        />

        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
          borderRadius: 16,
          padding: '48px',
          marginBottom: 32,
          color: '#fff',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Compare Tesla Accessory Stores
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', maxWidth: 600, margin: '0 auto' }}>
            Find out which store offers the best prices on identical products.
            We compare prices across {comparisons.length} store pairs.
          </p>
        </section>

        {/* Comparison Cards */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#111' }}>
            Available Comparisons
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}>
            {comparisons.map(comparison => {
              const s1 = STORE_INFO[comparison.store1] || { name: comparison.store1 };
              const s2 = STORE_INFO[comparison.store2] || { name: comparison.store2 };
              const d1 = getDiscountInfo(`https://${comparison.store1}.com`);
              const d2 = getDiscountInfo(`https://${comparison.store2}.com`);

              return (
                <Link
                  key={comparison.slug}
                  href={`/compare/${comparison.slug}`}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 24,
                    border: '1px solid #e5e7eb',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>
                      {s1.name}
                    </span>
                    <span style={{ fontSize: 14, color: '#9ca3af', fontWeight: 500 }}>vs</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>
                      {s2.name}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 16,
                  }}>
                    <span style={{
                      padding: '6px 12px',
                      background: '#f3f4f6',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#374151',
                    }}>
                      {comparison.matchCount} products compared
                    </span>
                  </div>

                  {(d1 || d2) && (
                    <div style={{
                      display: 'flex',
                      gap: 8,
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                    }}>
                      {d1 && (
                        <span style={{
                          padding: '4px 8px',
                          background: '#dcfce7',
                          borderRadius: 4,
                          fontSize: 12,
                          color: '#16a34a',
                          fontWeight: 500,
                        }}>
                          {s1.name}: {d1.percent}% off
                        </span>
                      )}
                      {d2 && (
                        <span style={{
                          padding: '4px 8px',
                          background: '#dcfce7',
                          borderRadius: 4,
                          fontSize: 12,
                          color: '#16a34a',
                          fontWeight: 500,
                        }}>
                          {s2.name}: {d2.percent}% off
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{
                    marginTop: 16,
                    textAlign: 'center',
                    fontSize: 14,
                    color: '#E82127',
                    fontWeight: 600,
                  }}>
                    View Comparison →
                  </div>
                </Link>
              );
            })}
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
            How We Compare Tesla Accessory Stores
          </h2>
          <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, marginBottom: 16 }}>
            We identify identical or very similar products sold by multiple stores, then compare
            their prices side-by-side. This helps you find the best deal without having to
            check every store yourself.
          </p>
          <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, marginBottom: 16 }}>
            Our comparisons focus on affiliate partner stores where we can also provide
            exclusive discount codes, giving you additional savings on top of already
            competitive prices.
          </p>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#111' }}>
            Why Prices Vary Between Stores
          </h3>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
              Different wholesale suppliers and bulk pricing
            </li>
            <li style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
              Shipping costs built into product prices
            </li>
            <li style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
              Regional pricing strategies
            </li>
            <li style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
              Promotional periods and sales
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
