'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TESLA_MODELS, CATEGORIES, SITE_NAME } from '@/lib/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showEmail, setShowEmail] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText('kontakt@statika-as.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-gradient" />
        <div className="footer-content">
          {/* Main Grid */}
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-brand">
              <Link href="/" className="footer-logo">
                <span className="logo-ev">EV</span>
                <span className="logo-price">Price</span>
                <span className="logo-hunt">Hunt</span>
              </Link>
              <p className="footer-tagline">
                Find the best deals on Tesla and EV accessories with exclusive discount codes from verified retailers.
              </p>
              <div className="footer-stats">
                <div className="stat">
                  <span className="stat-value">2,700+</span>
                  <span className="stat-label">Products</span>
                </div>
                <div className="stat-divider" />
                <div className="stat">
                  <span className="stat-value">6</span>
                  <span className="stat-label">Stores</span>
                </div>
                <div className="stat-divider" />
                <div className="stat">
                  <span className="stat-value">30%</span>
                  <span className="stat-label">Max Savings</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4 className="footer-heading">Tesla Models</h4>
              <ul className="footer-links">
                {TESLA_MODELS.filter(m => m.id !== 'universal').slice(0, 7).map(model => (
                  <li key={model.id}>
                    <Link href={`/model/${model.id}`} className="footer-link">
                      <span className="link-icon">→</span>
                      {model.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="footer-section">
              <h4 className="footer-heading">Categories</h4>
              <ul className="footer-links">
                {CATEGORIES.slice(0, 7).map(cat => (
                  <li key={cat.id}>
                    <Link href={`/category/${cat.id}`} className="footer-link">
                      <span className="link-icon">→</span>
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources & Contact */}
            <div className="footer-section">
              <h4 className="footer-heading">Resources</h4>
              <ul className="footer-links">
                <li>
                  <Link href="/top-10" className="footer-link">
                    <span className="link-icon">★</span>
                    Top 10 Lists
                  </Link>
                </li>
                <li>
                  <Link href="/stores" className="footer-link">
                    <span className="link-icon">◆</span>
                    Partner Stores
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="footer-link">
                    <span className="link-icon">⟷</span>
                    Price Compare
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="footer-link">
                    <span className="link-icon">○</span>
                    About Us
                  </Link>
                </li>
              </ul>

              <h4 className="footer-heading" style={{ marginTop: '2rem' }}>Contact</h4>
              {showEmail ? (
                <div className="email-box">
                  <span className="email-text">kontakt@statika-as.com</span>
                  <button onClick={copyEmail} className="copy-btn" title="Copy email">
                    {emailCopied ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowEmail(true)} className="show-email-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Show Email
                </button>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <p className="footer-copyright">
              © {currentYear} {SITE_NAME}. Not affiliated with Tesla, Inc.
            </p>
            <div className="footer-legal">
              <Link href="/privacy" className="legal-link">Privacy Policy</Link>
              <span className="legal-dot">•</span>
              <Link href="/terms" className="legal-link">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .footer {
          position: relative;
          background: linear-gradient(180deg, var(--bg-primary) 0%, #0a0a0a 100%);
          border-top: 1px solid var(--border-subtle);
          margin-top: 4rem;
          overflow: hidden;
        }

        .footer-gradient {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 1200px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 4rem 1.5rem 2rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 3rem;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem;
          }
          .footer-brand {
            grid-column: span 2;
          }
        }

        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .footer-brand {
            grid-column: span 1;
          }
        }

        /* Brand */
        .footer-brand {
          max-width: 320px;
        }

        .footer-logo {
          display: inline-flex;
          align-items: baseline;
          font-size: 1.5rem;
          font-weight: 700;
          text-decoration: none;
          margin-bottom: 1rem;
          transition: opacity 0.2s;
        }

        .footer-logo:hover {
          opacity: 0.8;
        }

        .logo-ev {
          color: var(--text-primary);
        }

        .logo-price {
          color: var(--accent-primary);
        }

        .logo-hunt {
          color: var(--text-primary);
        }

        .footer-tagline {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .footer-stats {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 1px solid var(--border-subtle);
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .stat-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-divider {
          width: 1px;
          height: 32px;
          background: var(--border-subtle);
        }

        /* Sections */
        .footer-section {
          min-width: 0;
        }

        .footer-heading {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s;
        }

        .footer-link:hover {
          color: var(--text-primary);
          transform: translateX(4px);
        }

        .link-icon {
          font-size: 0.7rem;
          color: var(--text-muted);
          transition: color 0.2s;
        }

        .footer-link:hover .link-icon {
          color: var(--accent-primary);
        }

        /* Email */
        .show-email-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .show-email-btn:hover {
          background: var(--bg-secondary);
          border-color: var(--border-default);
          color: var(--text-primary);
        }

        .show-email-btn svg {
          width: 16px;
          height: 16px;
        }

        .email-box {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(232, 33, 39, 0.1);
          border: 1px solid rgba(232, 33, 39, 0.2);
          border-radius: 8px;
        }

        .email-text {
          font-size: 0.875rem;
          color: var(--accent-primary);
          font-weight: 500;
        }

        .copy-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .copy-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .copy-btn svg {
          width: 14px;
          height: 14px;
        }

        /* Bottom */
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 2rem;
          margin-top: 3rem;
          border-top: 1px solid var(--border-subtle);
        }

        @media (max-width: 640px) {
          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }

        .footer-copyright {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .footer-legal {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .legal-link {
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s;
        }

        .legal-link:hover {
          color: var(--text-primary);
        }

        .legal-dot {
          color: var(--text-muted);
          font-size: 0.6rem;
        }
      `}</style>
    </>
  );
}
