import { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORIES, SITE_NAME, SITE_URL } from '@/lib/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: `Tesla Accessory Categories | Shop by Category | ${SITE_NAME}`,
  description: 'Browse Tesla accessories by category. Find floor mats, screen protectors, charging accessories, sunshades, and more for your Model 3, Model Y, Model S, Model X, or Cybertruck.',
  openGraph: {
    title: `Tesla Accessory Categories | ${SITE_NAME}`,
    description: 'Browse Tesla accessories by category.',
    url: `${SITE_URL}/category`,
    siteName: SITE_NAME,
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_URL}/category`,
  },
};

// Generate ItemList JSON-LD for categories
function generateCategoriesJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tesla Accessory Categories',
    description: 'Browse Tesla accessories by category',
    numberOfItems: CATEGORIES.length,
    itemListElement: CATEGORIES.map((category, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: category.name,
      description: category.description,
      url: `${SITE_URL}/category/${category.id}`,
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
        name: 'Categories',
        item: `${SITE_URL}/category`,
      },
    ],
  };
}

export default function CategoriesPage() {
  const categoriesJsonLd = generateCategoriesJsonLd();
  const breadcrumbJsonLd = generateBreadcrumbJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoriesJsonLd) }}
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
            { label: 'Categories' },
          ]}
        />

        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: 16,
          padding: '48px',
          marginBottom: 48,
          color: '#fff',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Shop by Category
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Find accessories for your Tesla. Browse categories to compare floor mats, screen protectors,
            chargers, and more from multiple stores.
          </p>
        </section>

        {/* Category Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24,
          marginBottom: 48,
        }}>
          {CATEGORIES.map(category => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              style={{
                display: 'block',
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                padding: '32px',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8 }}>
                {category.name}
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 16 }}>
                {category.description}
              </p>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#E82127',
                fontSize: 14,
                fontWeight: 600,
              }}>
                Browse Products
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
      </div>
    </>
  );
}
