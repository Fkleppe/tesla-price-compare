import Link from 'next/link';
import { Metadata } from 'next';
import { getProducts, getMatches, getProductStats, getInitialProducts } from '../lib/data';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '../lib/constants';
import HomeClient from '../components/HomeClient';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: `${SITE_NAME} | Compare Tesla Accessory Prices Across ${new Date().getFullYear()}`,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
};

const INITIAL_LIMIT = 48;

export default function Home() {
  // Server-side data fetching
  const allProducts = getProducts();
  const matches = getMatches();
  const stats = getProductStats(allProducts, matches);

  // Only pass first 48 products for SSR (not all 10,000+)
  const initialProducts = getInitialProducts(allProducts, INITIAL_LIMIT);

  // Calculate initial meta for pagination
  const totalProducts = allProducts.length;
  const totalPages = Math.ceil(totalProducts / INITIAL_LIMIT);
  const initialMeta = {
    total: totalProducts,
    page: 1,
    limit: INITIAL_LIMIT,
    totalPages,
    hasMore: totalPages > 1,
  };

  return (
    <>
      {/* SEO Hero Section - Server rendered FIRST for Google */}
      <section style={{ background: '#fff', padding: '32px 24px 0', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#111', marginBottom: 16 }}>
            Compare Tesla Accessory Prices in {new Date().getFullYear()}
          </h1>
          <p style={{ fontSize: 18, color: '#4b5563', lineHeight: 1.7, maxWidth: 800, margin: '0 auto 24px' }}>
            Find the best deals on Tesla accessories from {stats.totalStores}+ verified stores.
            Compare prices on floor mats, screen protectors, charging accessories for Model 3, Model Y, Model S, Model X, and Cybertruck.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, padding: '16px 0 32px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#E82127' }}>{stats.totalProducts.toLocaleString()}+</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Products</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#E82127' }}>{stats.totalStores}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Stores</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a' }}>20%</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Max Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive client component with all the filters/search */}
      <HomeClient
        initialProducts={initialProducts}
        initialMatches={matches}
        stats={stats}
        initialMeta={initialMeta}
      />

      {/* Additional SEO Content Section - Server rendered for Google */}
      <section style={{ background: '#fff', padding: '64px 24px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: 16, textAlign: 'center' }}>
            Why Compare Tesla Accessory Prices?
          </h2>
          <p style={{ fontSize: 17, color: '#4b5563', lineHeight: 1.8, textAlign: 'center', maxWidth: 800, margin: '0 auto 48px' }}>
            EVPriceHunt helps you find the best deals on Tesla and EV accessories from verified retailers.
            Compare prices across {stats.totalStores}+ stores, find exclusive discount codes, and save up to 20% on floor mats,
            screen protectors, charging accessories, and more for Model 3, Model Y, Model S, Model X, and Cybertruck.
          </p>

          {/* Model sections */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, marginBottom: 48 }}>
            <div style={{ background: '#f9fafb', padding: 32, borderRadius: 12 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 12 }}>
                Tesla Model 3 & Highland Accessories
              </h3>
              <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>
                Compare floor mats, 9H tempered glass screen protectors, center console wraps, and chargers
                for Model 3. Highland owners (2024+) can find accessories designed for the refreshed interior.
              </p>
              <Link href="/model/model-3" style={{ color: '#E82127', textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'inline-block', marginTop: 12 }}>
                Shop Model 3 Accessories →
              </Link>
            </div>

            <div style={{ background: '#f9fafb', padding: 32, borderRadius: 12 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 12 }}>
                Tesla Model Y & Juniper Accessories
              </h3>
              <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>
                Compare 7-piece floor mat sets, cargo liners, sunshade kits, and camping gear for Model Y.
                Model Y Juniper 2025+ owners can find accessories made for the refreshed design.
              </p>
              <Link href="/model/model-y" style={{ color: '#E82127', textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'inline-block', marginTop: 12 }}>
                Shop Model Y Accessories →
              </Link>
            </div>

            <div style={{ background: '#f9fafb', padding: 32, borderRadius: 12 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 12 }}>
                Cybertruck Accessories 2024-{new Date().getFullYear()}
              </h3>
              <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>
                Tesla&apos;s revolutionary pickup truck has a growing accessory ecosystem. Find bed liners,
                floor mats, tonneau covers, frunk organizers, and exterior protection.
                All accessories are designed specifically for Cybertruck&apos;s unique dimensions.
              </p>
              <Link href="/model/cybertruck" style={{ color: '#E82127', textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'inline-block', marginTop: 12 }}>
                Shop Cybertruck Accessories →
              </Link>
            </div>
          </div>

          {/* Category links */}
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 24 }}>
              Popular Tesla Accessory Categories
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {[
                { name: 'Floor Mats', slug: 'floor-mats', desc: 'All-weather TPE protection' },
                { name: 'Screen Protectors', slug: 'screen-protector', desc: '9H tempered glass' },
                { name: 'Charging', slug: 'charging', desc: 'Home & portable chargers' },
                { name: 'Sunshades', slug: 'sunshade', desc: 'UV protection & cooling' },
                { name: 'Wheel Covers', slug: 'wheel-covers', desc: 'Aero efficiency & style' },
                { name: 'Storage', slug: 'storage', desc: 'Organizers & solutions' },
              ].map(cat => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  style={{
                    display: 'block',
                    padding: '20px',
                    background: '#f9fafb',
                    borderRadius: 12,
                    textDecoration: 'none',
                    border: '1px solid #e5e7eb',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 4 }}>{cat.name}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{cat.desc}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Product listing for SEO - shows first 24 products in server-rendered HTML */}
          <div style={{ marginTop: 64 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 24 }}>
              Featured Tesla Accessories
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {initialProducts.slice(0, 24).map((p, idx) => (
                <article
                  key={idx}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    padding: 16
                  }}
                >
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
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                    {p.source} • {p.category?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>
                    ${p.price.toFixed(0)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
}
