import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_URL, SITE_NAME, TOP_10_LISTS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Top 10 Tesla Accessories 2025 | Best Products Ranked',
  description: 'Browse our Top 10 lists of Tesla accessories. Compare floor mats, screen protectors, chargers, and sunshades. Rankings updated monthly with discount codes.',
  keywords: [
    'best Tesla accessories 2025',
    'top Tesla accessories',
    'Tesla Model 3 accessories',
    'Tesla Model Y accessories',
    'Cybertruck accessories',
    'Tesla floor mats',
    'Tesla screen protector',
    'Tesla charger',
    'Tesla accessories ranking',
  ],
  openGraph: {
    title: 'Top 10 Tesla Accessories 2025 | Best Products Ranked',
    description: 'Browse our Top 10 lists of Tesla accessories. Compare floor mats, screen protectors, chargers, and sunshades.',
    url: `${SITE_URL}/top-10`,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top 10 Tesla Accessories 2025',
    description: 'Top 10 lists of Tesla accessories with discount codes.',
  },
  alternates: {
    canonical: `${SITE_URL}/top-10`,
  },
};

// Generate ItemList JSON-LD for the index page
function generateItemListJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top 10 Tesla Accessory Lists',
    description: 'Rankings of Tesla accessories across multiple categories',
    numberOfItems: TOP_10_LISTS.length,
    itemListElement: TOP_10_LISTS.map((list, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: list.title,
      description: list.description,
      url: `${SITE_URL}/top-10/${list.id}`,
    })),
  };
}

// Generate BreadcrumbList JSON-LD
function generateBreadcrumbJsonLd() {
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
        name: 'Top 10 Lists',
        item: `${SITE_URL}/top-10`,
      },
    ],
  };
}

// Category icons for visual appeal
const LIST_ICONS: Record<string, string> = {
  'mattress': '🛏️',
  'tent': '⛺',
  'floor-mats': '🧹',
  'screen-protector': '📱',
  'center-console': '🗄️',
  'charger': '🔌',
  'sunshade': '☀️',
  'wheel-covers': '🎡',
  'trunk-organizer': '📦',
  'phone-mount': '📲',
};

export default function Top10IndexPage() {
  const itemListJsonLd = generateItemListJsonLd();
  const breadcrumbJsonLd = generateBreadcrumbJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <Header />

        <main style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Top 10 Lists' },
            ]}
          />

          {/* Hero Section */}
          <section style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: 16,
            padding: '48px',
            marginBottom: 32,
            color: '#fff',
            textAlign: 'center',
          }}>
            <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>
              Top 10 Tesla Accessories
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
              We rank Tesla accessories based on customer reviews, materials, and price. Updated monthly.
              Find accessories for your Model 3, Model Y, Model S, Model X, or Cybertruck.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600
              }}>
                {TOP_10_LISTS.length} Lists
              </div>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600
              }}>
                Updated January 2025
              </div>
            </div>
          </section>

          {/* List Grid */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 24 }}>
              Browse All Top 10 Lists
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 20,
            }}>
              {TOP_10_LISTS.map((list) => (
                <Link
                  key={list.id}
                  href={`/top-10/${list.id}`}
                  style={{
                    display: 'block',
                    background: '#fff',
                    borderRadius: 16,
                    border: '1px solid #e5e7eb',
                    padding: '28px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      flexShrink: 0,
                    }}>
                      {LIST_ICONS[list.id] || '📋'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#111',
                        marginBottom: 8,
                      }}>
                        {list.title}
                      </h3>
                      <p style={{
                        fontSize: 14,
                        color: '#6b7280',
                        lineHeight: 1.5,
                        marginBottom: 12,
                      }}>
                        {list.description}
                      </p>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#E82127',
                      }}>
                        View Top 10
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* SEO Content Section */}
          <section style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '32px',
            marginBottom: 48,
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 16 }}>
              How We Rank Tesla Accessories
            </h2>
            <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, marginBottom: 16 }}>
              We rank products based on customer reviews, build materials, price, and Tesla model compatibility.
              Each list is updated monthly as new products come out and prices change.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginTop: 24 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 8 }}>Materials</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  We look at what products are made from. TPE floor mats and 9H tempered glass screen protectors tend to last longer.
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 8 }}>Customer Reviews</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  Real feedback from Tesla owners helps us identify products that deliver on their promises.
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 8 }}>Value & Pricing</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  We compare prices across multiple retailers and highlight products with the best value.
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 8 }}>Exclusive Discounts</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  Many products feature exclusive discount codes that can save you up to 20% off retail prices.
                </p>
              </div>
            </div>
          </section>

          {/* Model-specific CTA */}
          <section style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: 16,
            padding: '32px',
            marginBottom: 48,
            color: '#fff',
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              Browse by Tesla Model
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>
              Find accessories specifically designed for your Tesla model.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {[
                { id: 'model-3', name: 'Model 3' },
                { id: 'highland', name: 'Model 3 Highland' },
                { id: 'model-y', name: 'Model Y' },
                { id: 'juniper', name: 'Model Y Juniper' },
                { id: 'model-s', name: 'Model S' },
                { id: 'model-x', name: 'Model X' },
                { id: 'cybertruck', name: 'Cybertruck' },
              ].map(model => (
                <Link
                  key={model.id}
                  href={`/model/${model.id}`}
                  style={{
                    padding: '10px 18px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {model.name}
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
