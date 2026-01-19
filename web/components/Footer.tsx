'use client';

import Link from 'next/link';
import { TESLA_MODELS, CATEGORIES, SITE_NAME } from '@/lib/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              Tesla<span className="logo-accent">Compare</span>
            </Link>
            <p className="footer-desc">
              Find the best deals on Tesla accessories with exclusive discount codes from verified retailers.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Tesla Models</h4>
            <ul className="footer-links">
              {TESLA_MODELS.filter(m => m.id !== 'universal').slice(0, 6).map(model => (
                <li key={model.id}>
                  <Link href={`/model/${model.id}`}>{model.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Categories</h4>
            <ul className="footer-links">
              {CATEGORIES.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.id}`}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Resources</h4>
            <ul className="footer-links">
              <li><Link href="/top-10">Top 10 Lists</Link></li>
              <li><Link href="/stores">Partner Stores</Link></li>
              <li><Link href="/deals">Today's Deals</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} {SITE_NAME}. Not affiliated with Tesla, Inc.</p>
          <div className="footer-legal">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: #0a0a0a;
          color: #9ca3af;
          padding: 64px 24px 32px;
          margin-top: 64px;
        }
        .footer-container {
          max-width: 1440px;
          margin: 0 auto;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }
        .footer-brand {
          max-width: 280px;
        }
        .footer-logo {
          color: #fff;
          text-decoration: none;
          font-size: 20px;
          font-weight: 700;
          display: inline-block;
          margin-bottom: 16px;
        }
        .logo-accent {
          color: #E82127;
        }
        .footer-desc {
          font-size: 14px;
          line-height: 1.6;
        }
        .footer-section {
        }
        .footer-title {
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer-links li {
          margin-bottom: 10px;
        }
        .footer-links a {
          color: #9ca3af;
          text-decoration: none;
          font-size: 13px;
          transition: color 0.2s;
        }
        .footer-links a:hover {
          color: #fff;
        }
        .footer-bottom {
          border-top: 1px solid #262626;
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-bottom p {
          font-size: 13px;
          margin: 0;
        }
        .footer-legal {
          display: flex;
          gap: 24px;
        }
        .footer-legal a {
          color: #9ca3af;
          text-decoration: none;
          font-size: 13px;
          transition: color 0.2s;
        }
        .footer-legal a:hover {
          color: #fff;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .footer-brand {
            grid-column: 1 / -1;
            max-width: 100%;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
