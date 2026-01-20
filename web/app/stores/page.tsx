import { Metadata } from 'next';
import Link from 'next/link';
import { AFFILIATE_PARTNERS } from '@/lib/affiliate';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: `Partner Stores | Trusted Tesla Accessory Retailers | ${SITE_NAME}`,
  description: 'Shop from our verified partner stores for Tesla accessories. Get exclusive discount codes and compare prices across top retailers.',
  openGraph: {
    title: `Partner Stores | ${SITE_NAME}`,
    description: 'Trusted Tesla accessory retailers with exclusive discount codes.',
    url: `${SITE_URL}/stores`,
    siteName: SITE_NAME,
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_URL}/stores`,
  },
};

// Generate ItemList JSON-LD for stores
function generateStoresJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tesla Accessory Partner Stores',
    description: 'Verified Tesla accessory retailers with exclusive discount codes',
    numberOfItems: AFFILIATE_PARTNERS.length,
    itemListElement: AFFILIATE_PARTNERS.map((partner, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Organization',
        name: partner.name,
        url: `https://${partner.domains[0]}`,
        ...(partner.discountCode && {
          potentialAction: {
            '@type': 'UseAction',
            name: `Use discount code ${partner.discountCode} for ${partner.discountPercent}% off`,
          },
        }),
      },
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
        name: 'Partner Stores',
        item: `${SITE_URL}/stores`,
      },
    ],
  };
}

export default function StoresPage() {
  const storesJsonLd = generateStoresJsonLd();
  const breadcrumbJsonLd = generateBreadcrumbJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storesJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <Header />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Partner Stores' },
          ]}
        />

        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 100%)',
          borderRadius: 16,
          padding: '48px',
          marginBottom: 48,
          color: '#fff',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Our Partner Stores
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            We've partnered with the best Tesla accessory retailers to bring you exclusive discount codes
            and the lowest prices.
          </p>
        </section>

        {/* Store Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: 24,
          marginBottom: 48,
        }}>
          {AFFILIATE_PARTNERS.map(partner => (
            <article
              key={partner.name}
              style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
              }}
            >
              <div style={{
                padding: '32px',
                borderBottom: '1px solid #e5e7eb',
              }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 8 }}>
                  {partner.name}
                </h2>
                <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
                  {partner.domains[0]}
                </p>

                {partner.discountPercent > 0 && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#f0fdf4',
                    padding: '12px 20px',
                    borderRadius: 8,
                    marginBottom: 16,
                  }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#16a34a' }}>
                      {partner.discountPercent}% OFF
                    </span>
                  </div>
                )}

                {partner.discountCode && (
                  <div style={{ marginTop: 16 }}>
                    <span style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                      Discount Code:
                    </span>
                    <div style={{
                      display: 'inline-block',
                      background: '#111',
                      color: '#fff',
                      padding: '10px 20px',
                      borderRadius: 6,
                      fontFamily: 'monospace',
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}>
                      {partner.discountCode}
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                padding: '20px 32px',
                background: '#f9fafb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Link
                  href={`/?source=${encodeURIComponent(partner.name)}`}
                  style={{
                    color: '#E82127',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  View Products
                </Link>
                <a
                  href={`https://${partner.domains[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 20px',
                    background: '#111',
                    color: '#fff',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Visit Store
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Why Shop With Our Partners */}
        <section style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: 48,
          marginBottom: 48,
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111', marginBottom: 24, textAlign: 'center' }}>
            Why Shop With Our Partners?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 32,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64,
                height: 64,
                background: '#fef3c7',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 28,
              }}>
                %
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 8 }}>
                Exclusive Discounts
              </h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                Get access to discount codes you won't find anywhere else, saving up to 20% on your purchase.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64,
                height: 64,
                background: '#dbeafe',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 28,
              }}>
                ✓
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 8 }}>
                Verified Retailers
              </h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                These stores specialize in Tesla accessories and have established return policies and customer support.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64,
                height: 64,
                background: '#f0fdf4',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 28,
              }}>
                $
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 8 }}>
                Best Prices
              </h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                Compare prices across all partner stores to ensure you're getting the best deal possible.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      </div>
    </>
  );
}
