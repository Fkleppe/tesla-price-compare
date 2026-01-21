import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_URL, SITE_NAME, CATEGORIES, TOP_10_LISTS } from '@/lib/constants';

export const metadata: Metadata = {
  title: `About ${SITE_NAME} | Tesla Accessory Price Comparison`,
  description: `${SITE_NAME} compares Tesla accessory prices across multiple stores. Find the best deals on floor mats, screen protectors, chargers, and more for Model 3, Model Y, Model S, Model X, and Cybertruck.`,
  keywords: [
    'Tesla accessories',
    'Tesla price comparison',
    'Tesla discount codes',
    'Model 3 accessories',
    'Model Y accessories',
    'Cybertruck accessories',
    'EV accessories',
  ],
  openGraph: {
    title: `About ${SITE_NAME}`,
    description: 'Compare Tesla accessory prices and find exclusive discount codes.',
    url: `${SITE_URL}/about`,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `About ${SITE_NAME}`,
    description: 'Compare Tesla accessory prices and find exclusive discount codes.',
  },
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

function generateAboutJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${SITE_NAME}`,
    description: `${SITE_NAME} is a price comparison website for Tesla and EV accessories.`,
    mainEntity: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: 'Compare prices on Tesla accessories across multiple stores. Find the best deals with exclusive discount codes.',
      audience: {
        '@type': 'Audience',
        audienceType: 'Tesla owners and EV enthusiasts',
      },
    },
  };
}

export default function AboutPage() {
  const aboutJsonLd = generateAboutJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <Header />

        <main style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'About' },
            ]}
          />

          <article style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '48px',
            marginBottom: 32,
          }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#111', marginBottom: 24 }}>
              About {SITE_NAME}
            </h1>

            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 16 }}>
                What We Do
              </h2>
              <p style={{ fontSize: 16, color: '#4b5563', lineHeight: 1.8, marginBottom: 16 }}>
                {SITE_NAME} is a price comparison website for Tesla and electric vehicle accessories.
                We help Tesla owners find the best deals by comparing prices across multiple verified retailers.
              </p>
              <p style={{ fontSize: 16, color: '#4b5563', lineHeight: 1.8 }}>
                Our database includes over 2,700 products from trusted stores like Tesery, Tesmanian,
                Jowua, Shop4Tesla, and more. We also provide exclusive discount codes that can save
                you 5-20% on your purchase.
              </p>
            </section>

            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 16 }}>
                Tesla Models We Cover
              </h2>
              <ul style={{ fontSize: 16, color: '#4b5563', lineHeight: 2, paddingLeft: 24 }}>
                <li><strong>Model 3</strong> - Including the 2024+ Highland refresh</li>
                <li><strong>Model Y</strong> - Including the 2025+ Juniper refresh</li>
                <li><strong>Model S</strong> - All generations</li>
                <li><strong>Model X</strong> - All generations</li>
                <li><strong>Cybertruck</strong> - The revolutionary pickup truck</li>
              </ul>
            </section>

            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 16 }}>
                Product Categories
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    style={{
                      padding: '12px 16px',
                      background: '#f3f4f6',
                      borderRadius: 8,
                      textDecoration: 'none',
                      color: '#374151',
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </section>

            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 16 }}>
                Our Top 10 Lists
              </h2>
              <p style={{ fontSize: 16, color: '#4b5563', lineHeight: 1.8, marginBottom: 16 }}>
                We curate Top 10 lists for popular accessory categories, ranking products based on
                customer reviews, materials, price, and overall value.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TOP_10_LISTS.map(list => (
                  <Link
                    key={list.id}
                    href={`/top-10/${list.id}`}
                    style={{
                      padding: '8px 16px',
                      background: '#fef3c7',
                      borderRadius: 8,
                      textDecoration: 'none',
                      color: '#92400e',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {list.title}
                  </Link>
                ))}
              </div>
            </section>

            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 16 }}>
                Available Discount Codes
              </h2>
              <p style={{ fontSize: 16, color: '#4b5563', lineHeight: 1.8, marginBottom: 16 }}>
                We partner with top Tesla accessory stores to bring you exclusive discount codes:
              </p>
              <div style={{
                background: '#f0fdf4',
                borderRadius: 12,
                padding: 24,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 16,
              }}>
                {[
                  { store: 'Tesery', code: '123', percent: 5 },
                  { store: 'Jowua', code: 'AWD', percent: 5 },
                  { store: 'Shop4Tesla', code: '10', percent: 10 },
                  { store: 'Snuuzu', code: 'KLEPPE', percent: 10 },
                  { store: 'Havnby', code: 'AWD', percent: 10 },
                  { store: 'Tesloid', code: 'AWD', percent: 5 },
                ].map(d => (
                  <div key={d.store} style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 }}>{d.store}</div>
                    <div style={{ fontSize: 13, color: '#16a34a' }}>
                      Code: <strong style={{ fontFamily: 'monospace' }}>{d.code}</strong> ({d.percent}% off)
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 16 }}>
                How It Works
              </h2>
              <ol style={{ fontSize: 16, color: '#4b5563', lineHeight: 2, paddingLeft: 24 }}>
                <li>Browse our catalog or filter by your Tesla model</li>
                <li>Compare prices across multiple stores</li>
                <li>Find products with discount codes for extra savings</li>
                <li>Click "Visit" to go directly to the store</li>
                <li>Apply the discount code at checkout</li>
              </ol>
            </section>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}
