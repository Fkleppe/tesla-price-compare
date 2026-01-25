'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
  stats: {
    totalProducts: number;
    totalStores: number;
    totalMatches: number;
  };
}

export default function HeroSection({ stats }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <section className="hero">
        {/* Dramatic Background */}
        <div className="hero-bg">
          <div className="noise" />
          <div className="gradient-orb orb-1" />
          <div className="gradient-orb orb-2" />
          <div className="line-accent line-1" />
          <div className="line-accent line-2" />
        </div>

        <div className="hero-container">
          {/* Left Column - Main Content */}
          <div className="hero-main">
            {/* Live Indicator */}
            <div className={`live-badge ${mounted ? 'visible' : ''}`}>
              <span className="live-pulse" />
              <span className="live-text">LIVE PRICES</span>
              <span className="live-count">{stats.totalProducts.toLocaleString()} products</span>
            </div>

            {/* Headline */}
            <h1 className="headline">
              <span className={`line line-1 ${mounted ? 'visible' : ''}`}>
                <span className="word">Stop</span>
                <span className="word">Overpaying</span>
              </span>
              <span className={`line line-2 ${mounted ? 'visible' : ''}`}>
                <span className="word">for</span>
                <span className="word accent">Tesla</span>
              </span>
              <span className={`line line-3 ${mounted ? 'visible' : ''}`}>
                <span className="word accent">Accessories</span>
              </span>
            </h1>

            {/* Subtext */}
            <p className={`subtext ${mounted ? 'visible' : ''}`}>
              We scan <span className="highlight">{stats.totalStores} stores</span> daily.
              You save up to <span className="highlight green">20%</span>.
            </p>

            {/* Search Bar */}
            <div className={`hero-search ${mounted ? 'visible' : ''}`}>
              <Link href="/#products" className="search-bar">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <span className="search-placeholder">Search floor mats, screen protectors, chargers...</span>
                <span className="search-shortcut">
                  <kbd>/</kbd>
                </span>
              </Link>
            </div>

            {/* Quick Links */}
            <div className={`quick-links ${mounted ? 'visible' : ''}`}>
              <span className="quick-label">Popular:</span>
              <Link href="/category/floor-mats" className="quick-link">Floor Mats</Link>
              <Link href="/category/screen-protector" className="quick-link">Screen Protectors</Link>
              <Link href="/category/charging" className="quick-link">Chargers</Link>
              <Link href="/top-10" className="quick-link featured">Top 10</Link>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="hero-side">
            <div className={`stats-card ${mounted ? 'visible' : ''}`}>
              <div className="stats-header">
                <span className="stats-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3v18h18" />
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                  </svg>
                </span>
                <span className="stats-title">Price Intelligence</span>
              </div>

              <div className="stat-row">
                <div className="stat-info">
                  <span className="stat-label">Products tracked</span>
                  <span className="stat-value">{stats.totalProducts.toLocaleString()}</span>
                </div>
                <div className="stat-bar">
                  <div className="bar-fill" style={{ width: '92%' }} />
                </div>
              </div>

              <div className="stat-row">
                <div className="stat-info">
                  <span className="stat-label">Price comparisons</span>
                  <span className="stat-value">{stats.totalMatches}</span>
                </div>
                <div className="stat-bar">
                  <div className="bar-fill accent" style={{ width: '78%' }} />
                </div>
              </div>

              <div className="stat-row">
                <div className="stat-info">
                  <span className="stat-label">Average savings</span>
                  <span className="stat-value green">15%</span>
                </div>
                <div className="stat-bar">
                  <div className="bar-fill green" style={{ width: '65%' }} />
                </div>
              </div>

              <div className="stat-row">
                <div className="stat-info">
                  <span className="stat-label">Partner stores</span>
                  <span className="stat-value">{stats.totalStores}</span>
                </div>
                <div className="stat-bar">
                  <div className="bar-fill" style={{ width: '85%' }} />
                </div>
              </div>

              <div className="stats-footer">
                <span className="update-badge">
                  <span className="update-dot" />
                  Updated 2 hours ago
                </span>
              </div>
            </div>

            {/* Model Tags */}
            <div className={`model-tags ${mounted ? 'visible' : ''}`}>
              {[
                { name: 'Model 3', slug: 'model-3' },
                { name: 'Model Y', slug: 'model-y' },
                { name: 'Model S', slug: 'model-s' },
                { name: 'Model X', slug: 'model-x' },
                { name: 'Cybertruck', slug: 'cybertruck' },
              ].map((model, i) => (
                <Link
                  key={model.slug}
                  href={`/model/${model.slug}`}
                  className="model-tag"
                  style={{ animationDelay: `${0.8 + i * 0.05}s` }}
                >
                  <span className="tag-name">{model.name}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero {
          position: relative;
          display: flex;
          align-items: center;
          padding: 1.25rem 1.5rem 1.5rem;
          background: #050505;
          overflow: hidden;
        }

        /* Background Effects */
        .hero-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
        }

        .orb-1 {
          top: -20%;
          right: 10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(232, 33, 39, 0.25) 0%, transparent 70%);
        }

        .orb-2 {
          bottom: -30%;
          left: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(232, 33, 39, 0.15) 0%, transparent 70%);
        }

        .line-accent {
          position: absolute;
          background: linear-gradient(180deg, rgba(232, 33, 39, 0.5) 0%, transparent 100%);
        }

        .line-1 {
          top: 0;
          left: 15%;
          width: 1px;
          height: 200px;
        }

        .line-2 {
          top: 0;
          right: 25%;
          width: 1px;
          height: 150px;
        }

        /* Layout */
        .hero-container {
          position: relative;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 2rem;
          align-items: center;
          z-index: 1;
        }

        @media (max-width: 1100px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        /* Main Content */
        .hero-main {
          max-width: 700px;
        }

        /* Live Badge */
        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.625rem 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 100px;
          margin-bottom: 0.625rem;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .live-badge.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .live-pulse {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
        }

        .live-text {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #22c55e;
        }

        .live-count {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          padding-left: 0.75rem;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Headline */
        .headline {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 0.625rem;
        }

        .headline .line {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3em;
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .headline .line.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .headline .line-1 { transition-delay: 0.1s; }
        .headline .line-2 { transition-delay: 0.2s; }
        .headline .line-3 { transition-delay: 0.3s; }

        .headline .word {
          color: #fff;
        }

        .headline .word.accent {
          color: #E82127;
        }

        /* Subtext */
        .subtext {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.5;
          margin-bottom: 0.875rem;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s;
        }

        .subtext.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .subtext .highlight {
          color: #fff;
          font-weight: 600;
        }

        .subtext .highlight.green {
          color: #22c55e;
        }

        /* Search Bar */
        .hero-search {
          margin-bottom: 0.625rem;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s;
        }

        .hero-search.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .search-bar:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .search-icon {
          width: 20px;
          height: 20px;
          color: rgba(255, 255, 255, 0.4);
          flex-shrink: 0;
        }

        .search-placeholder {
          flex: 1;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .search-shortcut {
          display: flex;
          gap: 4px;
        }

        .search-shortcut kbd {
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }

        /* Quick Links */
        .quick-links {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s;
        }

        .quick-links.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .quick-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .quick-links :global(.quick-link) {
          padding: 0.375rem 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 100px;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .quick-links :global(.quick-link:hover) {
          background: rgba(232, 33, 39, 0.1);
          border-color: rgba(232, 33, 39, 0.3);
          color: #fff;
        }

        .quick-links :global(.quick-link.featured) {
          background: rgba(234, 179, 8, 0.1);
          border-color: rgba(234, 179, 8, 0.3);
          color: #fbbf24;
        }

        /* Stats Card */
        .hero-side {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stats-card {
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          opacity: 0;
          transform: translateX(40px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s;
        }

        .stats-card.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .stats-header {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          margin-bottom: 0.625rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .stats-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          background: rgba(232, 33, 39, 0.1);
          border-radius: 6px;
        }

        .stats-icon svg {
          width: 12px;
          height: 12px;
          color: #E82127;
        }

        .stats-title {
          font-size: 0.7rem;
          font-weight: 600;
          color: #fff;
        }

        .stat-row {
          margin-bottom: 0.5rem;
        }

        .stat-row:last-of-type {
          margin-bottom: 0.625rem;
        }

        .stat-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.375rem;
        }

        .stat-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .stat-value {
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
        }

        .stat-value.green {
          color: #22c55e;
        }

        .stat-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 100px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.5));
          border-radius: 100px;
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s;
        }

        .bar-fill.accent {
          background: linear-gradient(90deg, #E82127, #ff6b6b);
        }

        .bar-fill.green {
          background: linear-gradient(90deg, #22c55e, #4ade80);
        }

        .stats-footer {
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .update-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .update-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
        }

        /* Model Tags */
        .model-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          opacity: 0;
          transform: translateX(40px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s;
        }

        .model-tags.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .model-tags :global(.model-tag) {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.5rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .model-tags :global(.model-tag:hover) {
          background: rgba(232, 33, 39, 0.1);
          border-color: rgba(232, 33, 39, 0.2);
          color: #fff;
          transform: translateY(-2px);
        }

        .model-tags :global(.model-tag svg) {
          width: 14px;
          height: 14px;
          opacity: 0;
          transform: translate(-4px, 4px);
          transition: all 0.2s ease;
        }

        .model-tags :global(.model-tag:hover svg) {
          opacity: 1;
          transform: translate(0, 0);
        }

        @media (max-width: 1100px) {
          .hero-side {
            max-width: 500px;
          }
        }

        @media (max-width: 640px) {
          .hero {
            padding: 1rem 1rem 1.25rem;
          }

          .headline {
            font-size: 1.25rem;
          }

          .search-placeholder {
            display: none;
          }

          .search-bar::after {
            content: 'Search products...';
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.4);
          }

          .stats-card {
            padding: 0.625rem;
          }
        }
      `}</style>
    </>
  );
}
