import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Page Not Found | ${SITE_NAME}`,
  description: 'The page you are looking for could not be found. Browse our Tesla accessories or return to the homepage.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Header />

      <main style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 120,
          fontWeight: 800,
          color: '#e5e7eb',
          lineHeight: 1,
          marginBottom: 24,
        }}>
          404
        </div>

        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#111',
          marginBottom: 16,
        }}>
          Page Not Found
        </h1>

        <p style={{
          fontSize: 16,
          color: '#6b7280',
          marginBottom: 32,
          lineHeight: 1.6,
        }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Try browsing our Tesla accessories or return to the homepage.
        </p>

        <div style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              background: '#E82127',
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Go to Homepage
          </Link>

          <Link
            href="/category"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              background: '#fff',
              color: '#111',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Browse Categories
          </Link>
        </div>

        <div style={{
          marginTop: 48,
          padding: 24,
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
        }}>
          <p style={{
            fontSize: 14,
            color: '#6b7280',
            marginBottom: 16,
          }}>
            Popular sections:
          </p>
          <div style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Link href="/model/model-3" style={{ color: '#E82127', textDecoration: 'none', fontSize: 14 }}>
              Model 3
            </Link>
            <Link href="/model/model-y" style={{ color: '#E82127', textDecoration: 'none', fontSize: 14 }}>
              Model Y
            </Link>
            <Link href="/top-10" style={{ color: '#E82127', textDecoration: 'none', fontSize: 14 }}>
              Top 10 Lists
            </Link>
            <Link href="/stores" style={{ color: '#E82127', textDecoration: 'none', fontSize: 14 }}>
              Partner Stores
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
