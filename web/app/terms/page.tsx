import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Terms of Service | ${SITE_NAME}`,
  description: 'Terms of service for TeslaCompare. Read our terms and conditions for using our Tesla accessory comparison website.',
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Header />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Terms of Service' },
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
            Terms of Service
          </h1>

          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>
            Last updated: January 2025
          </p>

          <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginTop: 32, marginBottom: 16 }}>
              About TeslaCompare
            </h2>
            <p style={{ marginBottom: 16 }}>
              TeslaCompare is a price comparison website for Tesla accessories. We aggregate product information from various retailers to help you find and compare products. We are not affiliated with Tesla, Inc.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginTop: 32, marginBottom: 16 }}>
              Use of This Website
            </h2>
            <p style={{ marginBottom: 16 }}>
              By using TeslaCompare, you agree to:
            </p>
            <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Use the site for personal, non-commercial purposes</li>
              <li style={{ marginBottom: 8 }}>Not attempt to scrape, copy, or redistribute our content</li>
              <li style={{ marginBottom: 8 }}>Not interfere with the site's operation</li>
            </ul>

            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginTop: 32, marginBottom: 16 }}>
              Product Information
            </h2>
            <p style={{ marginBottom: 16 }}>
              We strive to display accurate product information, but prices and availability change frequently. Always verify details on the retailer's website before purchasing. We are not responsible for:
            </p>
            <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Price changes after you view our site</li>
              <li style={{ marginBottom: 8 }}>Product availability</li>
              <li style={{ marginBottom: 8 }}>Retailer policies or customer service</li>
              <li style={{ marginBottom: 8 }}>Product quality or compatibility</li>
            </ul>

            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginTop: 32, marginBottom: 16 }}>
              Affiliate Relationships
            </h2>
            <p style={{ marginBottom: 16 }}>
              TeslaCompare earns commissions from purchases made through our affiliate links. This does not affect the price you pay. We include discount codes when available to help you save money.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginTop: 32, marginBottom: 16 }}>
              Disclaimer
            </h2>
            <p style={{ marginBottom: 16 }}>
              TeslaCompare is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or timeliness of information on this site.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginTop: 32, marginBottom: 16 }}>
              Limitation of Liability
            </h2>
            <p style={{ marginBottom: 16 }}>
              TeslaCompare is not liable for any damages arising from your use of this website or purchases made through our links. Your use of this site is at your own risk.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginTop: 32, marginBottom: 16 }}>
              Changes to Terms
            </h2>
            <p style={{ marginBottom: 16 }}>
              We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
