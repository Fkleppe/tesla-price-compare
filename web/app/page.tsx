import Link from 'next/link';
import { Metadata } from 'next';
import { getProducts, getMatches, getProductStats, getInitialProducts } from '../lib/data';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '../lib/constants';
import Header from '../components/Header';
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

  // JSON-LD structured data for SEO
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // FAQ structured data for AI and Google
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the best website to compare Tesla accessory prices?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${SITE_NAME} compares prices from ${stats.totalStores}+ verified Tesla accessory retailers. We index ${stats.totalProducts.toLocaleString()}+ products and offer exclusive discount codes saving 5-20% off retail prices.`,
        },
      },
      {
        '@type': 'Question',
        name: 'How do I find discount codes for Tesla accessories?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'EVPriceHunt partners with top Tesla accessory stores to provide exclusive discount codes. Look for the green "% OFF" badge on products. Codes include: Tesery (code "123" for 5% off), Shop4Tesla (code "10" for 10% off), Snuuzu (code "KLEPPE" for 10% off), and more.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the best Tesla Model Y accessories in 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The most popular Tesla Model Y accessories are: 1) All-weather TPE floor mats ($50-150), 2) 9H tempered glass screen protectors ($20-50), 3) Center console wraps and organizers ($20-80), 4) Sunshades for windshield and panoramic roof ($30-100), 5) Wireless phone charger mounts ($30-80).',
        },
      },
      {
        '@type': 'Question',
        name: 'Are aftermarket Tesla accessories worth it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, aftermarket Tesla accessories from reputable brands often match or exceed OEM quality at lower prices. Brands like Tesmanian, Tesery, 3D MAXpider, and JOWUA have excellent reputations. Always check reviews and ensure compatibility with your specific Tesla model and year.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which stores sell the cheapest Tesla accessories?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Prices vary by product type. Tesery and Yeslak often have competitive everyday prices. JOWUA offers premium quality at higher prices. Use EVPriceHunt to compare the same product across stores - prices can differ by 20-40% for identical items.',
        },
      },
      {
        '@type': 'Question',
        name: 'What Tesla accessories should I buy first?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Essential Tesla accessories in order of priority: 1) All-weather floor mats to protect interior, 2) Screen protector to prevent scratches, 3) Center console organizer/wrap, 4) Sunshade for heat protection, 5) Wireless phone charger. These protect your investment and improve daily usability.',
        },
      },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Featured Tesla Accessories',
    numberOfItems: initialProducts.length,
    itemListElement: initialProducts.slice(0, 24).map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: p.title,
        image: p.image,
        offers: {
          '@type': 'Offer',
          price: p.price.toFixed(2),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* Header Navigation */}
      <Header stats={stats} />

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

      {/* FAQ Section - Important for AI/GEO */}
      <section style={{ background: '#f9fafb', padding: '64px 24px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: 32, textAlign: 'center' }}>
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <article style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 12 }}>
                What is the best website to compare Tesla accessory prices?
              </h3>
              <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
                {SITE_NAME} compares prices from {stats.totalStores}+ verified Tesla accessory retailers.
                We index {stats.totalProducts.toLocaleString()}+ products and offer exclusive discount codes
                saving 5-20% off retail prices. Our daily price updates ensure you always find the best deals.
              </p>
            </article>

            <article style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 12 }}>
                How do I find discount codes for Tesla accessories?
              </h3>
              <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
                EVPriceHunt partners with top Tesla accessory stores to provide exclusive discount codes.
                Look for the green &quot;% OFF&quot; badge on products. Active codes include: Tesery (code &quot;123&quot; for 5% off),
                Shop4Tesla (code &quot;10&quot; for 10% off), Snuuzu (code &quot;KLEPPE&quot; for 10% off), Yeslak (code &quot;AWD&quot; for 5% off),
                and Hansshow (code &quot;AWD&quot; for 5% off).
              </p>
            </article>

            <article style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 12 }}>
                What are the best Tesla Model Y accessories in {new Date().getFullYear()}?
              </h3>
              <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
                The most popular Tesla Model Y accessories are: 1) All-weather TPE floor mats ($50-150),
                2) 9H tempered glass screen protectors ($20-50), 3) Center console wraps and organizers ($20-80),
                4) Sunshades for windshield and panoramic roof ($30-100), 5) Wireless phone charger mounts ($30-80).
                For Model Y Juniper (2025+), look for accessories specifically designed for the refreshed interior.
              </p>
            </article>

            <article style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 12 }}>
                Are aftermarket Tesla accessories worth it?
              </h3>
              <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
                Yes, aftermarket Tesla accessories from reputable brands often match or exceed OEM quality at lower prices.
                Brands like Tesmanian, Tesery, 3D MAXpider, and JOWUA have excellent reputations among Tesla owners.
                Always check reviews and ensure compatibility with your specific Tesla model and year before purchasing.
              </p>
            </article>

            <article style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 12 }}>
                Which stores sell the cheapest Tesla accessories?
              </h3>
              <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
                Prices vary significantly by product type and store. Tesery and Yeslak often have competitive everyday prices.
                JOWUA offers premium quality at higher prices. Use EVPriceHunt to compare the same product across stores -
                prices can differ by 20-40% for identical items. Combine with our exclusive discount codes for maximum savings.
              </p>
            </article>

            <article style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 12 }}>
                What Tesla accessories should I buy first?
              </h3>
              <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
                Essential Tesla accessories in order of priority: 1) All-weather floor mats to protect your interior from dirt and water,
                2) Screen protector to prevent scratches on the touchscreen, 3) Center console organizer or wrap to keep things tidy,
                4) Sunshade for heat protection in summer, 5) Wireless phone charger for convenience.
                These protect your investment and improve daily usability.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
}
