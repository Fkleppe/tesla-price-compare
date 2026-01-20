import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description: 'Privacy policy for EVPriceHunt. Learn how we collect, use, and protect your information.',
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Header />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Privacy Policy' },
          ]}
        />

        <article style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '48px',
          marginBottom: 48,
        }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111', marginBottom: 24 }}>
            Privacy Policy
          </h1>

          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>
            Last updated: January 2026
          </p>

          <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginTop: 32, marginBottom: 16 }}>
              Information We Collect
            </h2>
            <p style={{ marginBottom: 16 }}>
              EVPriceHunt is a price comparison website. We do not require user accounts or collect personal information directly. When you visit our site, we may collect:
            </p>
            <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Anonymous usage data (pages visited, time on site)</li>
              <li style={{ marginBottom: 8 }}>Device information (browser type, screen size)</li>
              <li style={{ marginBottom: 8 }}>Referral source (how you found our site)</li>
            </ul>

            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginTop: 32, marginBottom: 16 }}>
              How We Use Information
            </h2>
            <p style={{ marginBottom: 16 }}>
              We use collected information to:
            </p>
            <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Improve our website and user experience</li>
              <li style={{ marginBottom: 8 }}>Analyze traffic patterns and popular products</li>
              <li style={{ marginBottom: 8 }}>Ensure our site works correctly on different devices</li>
            </ul>

            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginTop: 32, marginBottom: 16 }}>
              Affiliate Links
            </h2>
            <p style={{ marginBottom: 16 }}>
              EVPriceHunt contains affiliate links to partner stores. When you click these links and make a purchase, we may earn a commission at no extra cost to you. This helps us maintain and improve the site.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginTop: 32, marginBottom: 16 }}>
              Cookies
            </h2>
            <p style={{ marginBottom: 16 }}>
              We use cookies for basic site functionality and analytics. You can disable cookies in your browser settings, though some features may not work correctly.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginTop: 32, marginBottom: 16 }}>
              Third-Party Services
            </h2>
            <p style={{ marginBottom: 16 }}>
              We may use third-party services for analytics and hosting. These services have their own privacy policies.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginTop: 32, marginBottom: 16 }}>
              Contact
            </h2>
            <p style={{ marginBottom: 16 }}>
              For privacy-related questions, contact us through the information provided on our website.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
