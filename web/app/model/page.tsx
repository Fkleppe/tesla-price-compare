import { Metadata } from 'next';
import Link from 'next/link';
import { TESLA_MODELS, SITE_NAME, SITE_URL } from '@/lib/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: `Tesla Model Accessories | Shop by Vehicle | ${SITE_NAME}`,
  description: 'Find accessories specifically designed for your Tesla. Browse by Model 3, Model 3 Highland, Model Y, Model Y Juniper, Model S, Model X, and Cybertruck.',
  keywords: [
    'Tesla accessories by model',
    'Tesla Model 3 accessories',
    'Tesla Model Y accessories',
    'Tesla Model S accessories',
    'Tesla Model X accessories',
    'Cybertruck accessories',
    'Model 3 Highland accessories',
    'Model Y Juniper accessories',
    'Tesla aftermarket parts',
  ],
  openGraph: {
    title: `Tesla Model Accessories | ${SITE_NAME}`,
    description: 'Shop accessories by Tesla model.',
    url: `${SITE_URL}/model`,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Tesla Model Accessories | ${SITE_NAME}`,
    description: 'Find accessories designed for your specific Tesla model.',
  },
  alternates: {
    canonical: `${SITE_URL}/model`,
  },
};


const MODEL_COLORS: Record<string, string> = {
  'model-3': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  'highland': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  'model-y': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'juniper': 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
  'model-s': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  'model-x': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'cybertruck': 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
};

// Generate ItemList JSON-LD for models
function generateModelsJsonLd() {
  const models = TESLA_MODELS.filter(m => m.id !== 'universal');
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tesla Model Accessory Collections',
    description: 'Browse Tesla accessories by vehicle model',
    numberOfItems: models.length,
    itemListElement: models.map((model, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `Tesla ${model.name} Accessories`,
      url: `${SITE_URL}/model/${model.id}`,
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
        name: 'Tesla Models',
        item: `${SITE_URL}/model`,
      },
    ],
  };
}

export default function ModelsPage() {
  const models = TESLA_MODELS.filter(m => m.id !== 'universal');
  const modelsJsonLd = generateModelsJsonLd();
  const breadcrumbJsonLd = generateBreadcrumbJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(modelsJsonLd) }}
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
            { label: 'Tesla Models' },
          ]}
        />

        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, #E82127 0%, #b91c1c 100%)',
          borderRadius: 16,
          padding: '48px',
          marginBottom: 48,
          color: '#fff',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Shop by Tesla Model
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Find accessories specifically designed for your Tesla. Every product is verified for compatibility
            with your specific model.
          </p>
        </section>

        {/* Model Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24,
          marginBottom: 48,
        }}>
          {models.map(model => (
            <Link
              key={model.id}
              href={`/model/${model.id}`}
              style={{
                display: 'block',
                background: MODEL_COLORS[model.id] || '#111',
                borderRadius: 16,
                padding: '40px 32px',
                textDecoration: 'none',
                color: '#fff',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                {model.name}
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 20 }}>
                Browse all accessories for Tesla {model.name}
              </p>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.2)',
                padding: '10px 16px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
              }}>
                Shop Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        {/* SEO Content */}
        <section style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: 48,
          marginBottom: 48,
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111', marginBottom: 24 }}>
            Tesla Accessories by Model
          </h2>
          <div style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 16 }}>
              Finding the right accessories for your Tesla is easy with EVPriceHunt. We&apos;ve organized
              our entire catalog by Tesla model, so you can quickly find products that are guaranteed
              to fit your specific vehicle.
            </p>
            <p style={{ marginBottom: 16 }}>
              Whether you drive a Model 3, the refreshed Model 3 Highland, Model Y, the new Model Y Juniper,
              Model S, Model X, or the revolutionary Cybertruck, we have accessories tailored to your needs.
            </p>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginTop: 24, marginBottom: 12 }}>
              Why Shop by Model?
            </h3>
            <ul style={{ paddingLeft: 20 }}>
              <li style={{ marginBottom: 8 }}>Guaranteed compatibility with your specific Tesla</li>
              <li style={{ marginBottom: 8 }}>Custom-fit floor mats and accessories</li>
              <li style={{ marginBottom: 8 }}>Model-specific charging solutions</li>
              <li style={{ marginBottom: 8 }}>Interior accessories designed for your exact console and storage</li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
      </div>
    </>
  );
}
