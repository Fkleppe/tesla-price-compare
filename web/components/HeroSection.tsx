'use client';

import Link from 'next/link';
import { useState } from 'react';

interface HeroSectionProps {
  stats: {
    totalProducts: number;
    totalStores: number;
    totalMatches: number;
  };
}

export default function HeroSection({ stats }: HeroSectionProps) {
  // Use state initializer to avoid hydration mismatch
  const [mounted] = useState(() => typeof window !== 'undefined');

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          {/* Eyebrow */}
          <span className={`eyebrow ${mounted ? 'visible' : ''}`}>
            <span className="pulse" />
            {stats.totalStores} stores · {stats.totalProducts.toLocaleString()} products
          </span>

          {/* Headline */}
          <h1 className={`headline ${mounted ? 'visible' : ''}`}>
            Compare <span className="accent">Tesla</span> accessory prices
          </h1>

          {/* Actions */}
          <div className={`actions ${mounted ? 'visible' : ''}`}>
            <Link href="/#products" className="btn-primary">
              Browse all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            {[
              { name: 'Model 3', slug: 'model-3' },
              { name: 'Model Y', slug: 'model-y' },
              { name: 'Model S', slug: 'model-s' },
              { name: 'Cybertruck', slug: 'cybertruck' },
            ].map((m) => (
              <Link key={m.slug} href={`/model/${m.slug}`} className="btn-ghost">
                {m.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero {
          padding: 2.5rem 1.5rem 2rem;
          background: #000;
        }

        .hero-inner {
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1rem;
        }

        /* Eyebrow */
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: rgba(255, 255, 255, 0.5);
          opacity: 0;
          transform: translateY(8px);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .eyebrow.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .pulse {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          50% { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
        }

        /* Headline */
        .headline {
          font-size: clamp(1.5rem, 4vw, 2.25rem);
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -0.035em;
          color: rgba(255, 255, 255, 0.95);
          opacity: 0;
          transform: translateY(12px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.05s;
        }

        .headline.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .headline .accent {
          color: #E82127;
        }

        /* Actions */
        .actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
        }

        .actions.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero :global(.btn-primary) {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          background: #E82127;
          color: #fff;
          font-size: 0.8125rem;
          font-weight: 600;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .hero :global(.btn-primary:hover) {
          background: #d11920;
          transform: translateY(-1px);
        }

        .hero :global(.btn-primary svg) {
          opacity: 0.9;
        }

        .hero :global(.btn-ghost) {
          padding: 0.5rem 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8125rem;
          font-weight: 500;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .hero :global(.btn-ghost:hover) {
          color: #fff;
          background: rgba(255, 255, 255, 0.06);
        }

        /* Tablet */
        @media (max-width: 768px) {
          .hero {
            padding: 2rem 1.25rem 1.75rem;
          }

          .hero-inner {
            gap: 0.875rem;
          }

          .headline {
            font-size: clamp(1.375rem, 5vw, 1.75rem);
          }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .hero {
            padding: 1.75rem 1rem 1.5rem;
          }

          .hero-inner {
            gap: 0.75rem;
          }

          .eyebrow {
            font-size: 0.6875rem;
          }

          .headline {
            font-size: 1.25rem;
            line-height: 1.25;
          }

          .actions {
            gap: 0.5rem;
            row-gap: 0.375rem;
          }

          .hero :global(.btn-primary) {
            font-size: 0.8125rem;
            padding: 0.5rem 0.875rem;
            min-height: 36px;
          }

          .hero :global(.btn-ghost) {
            font-size: 0.75rem;
            padding: 0.375rem 0.5rem;
            min-height: 32px;
          }
        }

        /* Small phones */
        @media (max-width: 380px) {
          .hero {
            padding: 1.5rem 0.875rem 1.25rem;
          }

          .headline {
            font-size: 1.125rem;
          }

          .actions {
            gap: 0.375rem;
          }

          .hero :global(.btn-primary) {
            font-size: 0.75rem;
            padding: 0.4375rem 0.75rem;
          }

          .hero :global(.btn-ghost) {
            font-size: 0.6875rem;
            padding: 0.3125rem 0.4375rem;
          }
        }
      `}</style>
    </>
  );
}
