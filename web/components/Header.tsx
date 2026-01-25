'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { TOP_10_LISTS, TESLA_MODELS, CATEGORIES } from '@/lib/constants';

interface HeaderProps {
  stats?: {
    totalProducts: number;
    totalStores: number;
    discountedCount: number;
  };
}

export default function Header({ stats }: HeaderProps) {
  const [showModelsMenu, setShowModelsMenu] = useState(false);
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [showTop10Menu, setShowTop10Menu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const modelsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const categoriesTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const top10TimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
        setMobileSubmenu(null);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileSubmenu(null);
  };

  const handleModelsEnter = () => {
    if (modelsTimeoutRef.current) clearTimeout(modelsTimeoutRef.current);
    setShowModelsMenu(true);
    setShowCategoriesMenu(false);
    setShowTop10Menu(false);
  };

  const handleModelsLeave = () => {
    modelsTimeoutRef.current = setTimeout(() => setShowModelsMenu(false), 150);
  };

  const handleCategoriesEnter = () => {
    if (categoriesTimeoutRef.current) clearTimeout(categoriesTimeoutRef.current);
    setShowCategoriesMenu(true);
    setShowModelsMenu(false);
    setShowTop10Menu(false);
  };

  const handleCategoriesLeave = () => {
    categoriesTimeoutRef.current = setTimeout(() => setShowCategoriesMenu(false), 150);
  };

  const handleTop10Enter = () => {
    if (top10TimeoutRef.current) clearTimeout(top10TimeoutRef.current);
    setShowTop10Menu(true);
    setShowModelsMenu(false);
    setShowCategoriesMenu(false);
  };

  const handleTop10Leave = () => {
    top10TimeoutRef.current = setTimeout(() => setShowTop10Menu(false), 150);
  };

  return (
    <>
      <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="header-inner">
          {/* Logo */}
          <Link href="/" className="logo">
            <span className="logo-text">
              EV<span className="logo-accent">PriceHunt</span>
            </span>
            <div className="logo-glow" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            {/* Models */}
            <div
              className="nav-item"
              onMouseEnter={handleModelsEnter}
              onMouseLeave={handleModelsLeave}
            >
              <button className="nav-button">
                Models
                <svg className={`nav-chevron ${showModelsMenu ? 'rotated' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {showModelsMenu && (
                <div className="dropdown">
                  <Link href="/model" className="dropdown-header">
                    <span>All Models</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <div className="dropdown-grid">
                    {TESLA_MODELS.filter(m => m.id !== 'universal').map((model) => (
                      <Link key={model.id} href={`/model/${model.id}`} className="dropdown-item">
                        <div className="dropdown-item-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        </div>
                        <span>{model.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Categories */}
            <div
              className="nav-item"
              onMouseEnter={handleCategoriesEnter}
              onMouseLeave={handleCategoriesLeave}
            >
              <button className="nav-button">
                Categories
                <svg className={`nav-chevron ${showCategoriesMenu ? 'rotated' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {showCategoriesMenu && (
                <div className="dropdown dropdown-wide">
                  <Link href="/category" className="dropdown-header">
                    <span>All Categories</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <div className="dropdown-categories">
                    {CATEGORIES.slice(0, 12).map((cat) => (
                      <Link key={cat.id} href={`/category/${cat.id}`} className="dropdown-category">
                        {cat.name}
                      </Link>
                    ))}
                    {CATEGORIES.length > 12 && (
                      <Link href="/category" className="dropdown-more">
                        +{CATEGORIES.length - 12} more
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Top 10 - Featured */}
            <div
              className="nav-item"
              onMouseEnter={handleTop10Enter}
              onMouseLeave={handleTop10Leave}
            >
              <button className="nav-button nav-button-featured">
                <svg className="star-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Top 10
                <svg className={`nav-chevron ${showTop10Menu ? 'rotated' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {showTop10Menu && (
                <div className="dropdown dropdown-featured">
                  <Link href="/top-10" className="dropdown-header dropdown-header-featured">
                    <span>All Top 10 Lists</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <div className="dropdown-list">
                    {TOP_10_LISTS.map((list) => (
                      <Link key={list.id} href={`/top-10/${list.id}`} className="dropdown-list-item">
                        <span className="dropdown-list-rank">#{TOP_10_LISTS.indexOf(list) + 1}</span>
                        <span>{list.title.replace('Best ', '')}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/stores" className="nav-link">Stores</Link>
            <Link href="/compare" className="nav-link">Compare</Link>
          </nav>

          {/* Stats */}
          {stats && (
            <div className="stats">
              <div className="stat">
                <span className="stat-value">{stats.totalProducts.toLocaleString()}</span>
                <span className="stat-label">Products</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-value">{stats.totalStores}</span>
                <span className="stat-label">Stores</span>
              </div>
              <div className="stat-divider" />
              <div className="stat stat-sale">
                <span className="stat-value">{stats.discountedCount}</span>
                <span className="stat-label">On Sale</span>
                <div className="stat-pulse" />
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
              <span />
              <span />
              <span />
            </div>
          </button>
        </div>
      </header>

      {/* Spacer */}
      <div className="header-spacer" />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-overlay" onClick={closeMobileMenu} />
          <nav className="mobile-menu">
            <div className="mobile-menu-header">
              <Link href="/" className="mobile-logo" onClick={closeMobileMenu}>
                EV<span>PriceHunt</span>
              </Link>
              <button className="mobile-close" onClick={closeMobileMenu}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {stats && (
              <div className="mobile-stats">
                <div className="mobile-stat">
                  <span className="mobile-stat-value">{stats.totalProducts.toLocaleString()}</span>
                  <span className="mobile-stat-label">Products</span>
                </div>
                <div className="mobile-stat">
                  <span className="mobile-stat-value">{stats.totalStores}</span>
                  <span className="mobile-stat-label">Stores</span>
                </div>
                <div className="mobile-stat mobile-stat-sale">
                  <span className="mobile-stat-value">{stats.discountedCount}</span>
                  <span className="mobile-stat-label">On Sale</span>
                </div>
              </div>
            )}

            <div className="mobile-nav">
              {/* Models */}
              <button
                className="mobile-nav-item"
                onClick={() => setMobileSubmenu(mobileSubmenu === 'models' ? null : 'models')}
              >
                <span>Tesla Models</span>
                <svg className={mobileSubmenu === 'models' ? 'rotated' : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {mobileSubmenu === 'models' && (
                <div className="mobile-submenu">
                  <Link href="/model" onClick={closeMobileMenu} className="mobile-submenu-header">All Models</Link>
                  {TESLA_MODELS.filter(m => m.id !== 'universal').map(model => (
                    <Link key={model.id} href={`/model/${model.id}`} onClick={closeMobileMenu} className="mobile-submenu-item">
                      {model.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Categories */}
              <button
                className="mobile-nav-item"
                onClick={() => setMobileSubmenu(mobileSubmenu === 'categories' ? null : 'categories')}
              >
                <span>Categories</span>
                <svg className={mobileSubmenu === 'categories' ? 'rotated' : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {mobileSubmenu === 'categories' && (
                <div className="mobile-submenu mobile-submenu-scroll">
                  <Link href="/category" onClick={closeMobileMenu} className="mobile-submenu-header">All Categories</Link>
                  {CATEGORIES.map(cat => (
                    <Link key={cat.id} href={`/category/${cat.id}`} onClick={closeMobileMenu} className="mobile-submenu-item">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Top 10 */}
              <button
                className="mobile-nav-item mobile-nav-item-featured"
                onClick={() => setMobileSubmenu(mobileSubmenu === 'top10' ? null : 'top10')}
              >
                <div className="mobile-nav-item-inner">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="mobile-star">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>Top 10 Lists</span>
                </div>
                <svg className={mobileSubmenu === 'top10' ? 'rotated' : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {mobileSubmenu === 'top10' && (
                <div className="mobile-submenu mobile-submenu-featured">
                  <Link href="/top-10" onClick={closeMobileMenu} className="mobile-submenu-header">All Top 10 Lists</Link>
                  {TOP_10_LISTS.map(list => (
                    <Link key={list.id} href={`/top-10/${list.id}`} onClick={closeMobileMenu} className="mobile-submenu-item">
                      {list.title.replace('Best ', '')}
                    </Link>
                  ))}
                </div>
              )}

              <Link href="/stores" onClick={closeMobileMenu} className="mobile-nav-link">Partner Stores</Link>
              <Link href="/compare" onClick={closeMobileMenu} className="mobile-nav-link">Compare Prices</Link>
              <Link href="/about" onClick={closeMobileMenu} className="mobile-nav-link">About Us</Link>
            </div>
          </nav>
        </>
      )}

      <style jsx>{`
        /* ===== HEADER ===== */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 72px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          z-index: 200;
          transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
        }

        .header-scrolled {
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }

        .header-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 24px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }

        .header-spacer {
          height: 72px;
        }

        /* ===== LOGO ===== */
        .logo {
          position: relative;
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        .logo-text {
          font-family: 'Satoshi', -apple-system, sans-serif;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #09090B;
          transition: transform 0.3s cubic-bezier(0.19, 1, 0.22, 1);
        }

        .logo:hover .logo-text {
          transform: scale(1.02);
        }

        .logo-accent {
          background: linear-gradient(135deg, #E82127 0%, #FF4D4D 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-glow {
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #E82127, transparent);
          border-radius: 2px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .logo:hover .logo-glow {
          opacity: 1;
        }

        /* ===== DESKTOP NAV ===== */
        .nav-desktop {
          display: none;
          align-items: center;
          gap: 4px;
          flex: 1;
          justify-content: center;
        }

        @media (min-width: 1024px) {
          .nav-desktop { display: flex; }
        }

        .nav-item {
          position: relative;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          font-family: 'Satoshi', -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #3F3F46;
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-button:hover {
          color: #09090B;
          background: rgba(0, 0, 0, 0.04);
        }

        .nav-button-featured {
          color: #E82127;
        }

        .nav-button-featured:hover {
          color: #CC1C21;
          background: rgba(232, 33, 39, 0.06);
        }

        .star-icon {
          width: 16px;
          height: 16px;
        }

        .nav-chevron {
          width: 14px;
          height: 14px;
          transition: transform 0.2s ease;
        }

        .nav-chevron.rotated {
          transform: rotate(180deg);
        }

        .nav-link {
          padding: 10px 16px;
          font-family: 'Satoshi', -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #3F3F46;
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          color: #09090B;
          background: rgba(0, 0, 0, 0.04);
        }

        /* ===== DROPDOWNS ===== */
        .dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 16px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06);
          min-width: 280px;
          padding: 8px;
          animation: dropdownIn 0.2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
          overflow: hidden;
        }

        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        .dropdown-wide {
          min-width: 380px;
        }

        .dropdown-featured {
          border: 1px solid rgba(232, 33, 39, 0.1);
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          font-family: 'Satoshi', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #09090B;
          text-decoration: none;
          border-radius: 10px;
          margin-bottom: 4px;
          transition: background 0.15s ease;
        }

        .dropdown-header:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        .dropdown-header svg {
          width: 16px;
          height: 16px;
          opacity: 0.5;
        }

        .dropdown-header-featured {
          background: rgba(232, 33, 39, 0.04);
          color: #E82127;
        }

        .dropdown-header-featured:hover {
          background: rgba(232, 33, 39, 0.08);
        }

        .dropdown-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          text-decoration: none;
          color: #52525B;
          font-size: 14px;
          font-weight: 500;
          border-radius: 10px;
          transition: all 0.15s ease;
        }

        .dropdown-item:hover {
          background: rgba(0, 0, 0, 0.04);
          color: #09090B;
        }

        .dropdown-item-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #F4F4F5 0%, #E4E4E7 100%);
          border-radius: 8px;
        }

        .dropdown-item-icon svg {
          width: 16px;
          height: 16px;
          color: #71717A;
        }

        .dropdown-categories {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2px;
        }

        .dropdown-category {
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 500;
          color: #52525B;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.15s ease;
        }

        .dropdown-category:hover {
          background: rgba(0, 0, 0, 0.04);
          color: #09090B;
        }

        .dropdown-more {
          grid-column: span 2;
          padding: 12px;
          font-size: 13px;
          font-weight: 600;
          color: #E82127;
          text-decoration: none;
          text-align: center;
          border-radius: 8px;
          background: rgba(232, 33, 39, 0.04);
          transition: background 0.15s ease;
        }

        .dropdown-more:hover {
          background: rgba(232, 33, 39, 0.08);
        }

        .dropdown-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dropdown-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          text-decoration: none;
          color: #52525B;
          font-size: 14px;
          font-weight: 500;
          border-radius: 10px;
          transition: all 0.15s ease;
        }

        .dropdown-list-item:hover {
          background: rgba(232, 33, 39, 0.04);
          color: #E82127;
        }

        .dropdown-list-rank {
          font-family: 'Satoshi', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #A1A1AA;
          width: 24px;
        }

        /* ===== STATS ===== */
        .stats {
          display: none;
          align-items: center;
          gap: 16px;
        }

        @media (min-width: 1280px) {
          .stats { display: flex; }
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .stat-value {
          font-family: 'Satoshi', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #09090B;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 500;
          color: #71717A;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-divider {
          width: 1px;
          height: 24px;
          background: rgba(0, 0, 0, 0.08);
        }

        .stat-sale .stat-value {
          color: #16A34A;
        }

        .stat-pulse {
          position: absolute;
          top: 0;
          right: -6px;
          width: 6px;
          height: 6px;
          background: #22C55E;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        /* ===== MOBILE MENU BUTTON ===== */
        .mobile-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: transparent;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        @media (min-width: 1024px) {
          .mobile-menu-btn { display: none; }
        }

        .mobile-menu-btn:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        .hamburger {
          width: 20px;
          height: 14px;
          position: relative;
        }

        .hamburger span {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: #09090B;
          border-radius: 1px;
          transition: all 0.3s ease;
        }

        .hamburger span:nth-child(1) { top: 0; }
        .hamburger span:nth-child(2) { top: 6px; }
        .hamburger span:nth-child(3) { top: 12px; }

        .hamburger.active span:nth-child(1) {
          top: 6px;
          transform: rotate(45deg);
        }

        .hamburger.active span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.active span:nth-child(3) {
          top: 6px;
          transform: rotate(-45deg);
        }

        /* ===== MOBILE MENU ===== */
        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(9, 9, 11, 0.5);
          backdrop-filter: blur(8px);
          z-index: 300;
          animation: fadeIn 0.2s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          max-width: 400px;
          background: #FFFFFF;
          z-index: 400;
          overflow-y: auto;
          animation: slideIn 0.3s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .mobile-logo {
          font-family: 'Satoshi', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #09090B;
          text-decoration: none;
        }

        .mobile-logo span {
          background: linear-gradient(135deg, #E82127 0%, #FF4D4D 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .mobile-close {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.04);
          border: none;
          border-radius: 12px;
          cursor: pointer;
        }

        .mobile-close svg {
          width: 20px;
          height: 20px;
          color: #71717A;
        }

        .mobile-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          padding: 16px 20px;
          background: #FAFAFA;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .mobile-stat {
          text-align: center;
          padding: 12px 8px;
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .mobile-stat-value {
          display: block;
          font-family: 'Satoshi', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #09090B;
        }

        .mobile-stat-label {
          font-size: 11px;
          font-weight: 500;
          color: #71717A;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .mobile-stat-sale {
          border-color: rgba(34, 197, 94, 0.2);
          background: rgba(34, 197, 94, 0.04);
        }

        .mobile-stat-sale .mobile-stat-value {
          color: #16A34A;
        }

        .mobile-nav {
          padding: 8px;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 16px;
          font-family: 'Satoshi', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #09090B;
          background: transparent;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .mobile-nav-item:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        .mobile-nav-item svg {
          width: 18px;
          height: 18px;
          color: #A1A1AA;
          transition: transform 0.2s ease;
        }

        .mobile-nav-item svg.rotated {
          transform: rotate(180deg);
        }

        .mobile-nav-item-featured {
          color: #E82127;
        }

        .mobile-nav-item-inner {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mobile-star {
          width: 18px;
          height: 18px;
        }

        .mobile-nav-link {
          display: block;
          padding: 16px;
          font-family: 'Satoshi', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #09090B;
          text-decoration: none;
          border-radius: 12px;
          transition: background 0.15s ease;
        }

        .mobile-nav-link:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        .mobile-submenu {
          background: #FAFAFA;
          border-radius: 12px;
          margin: 4px 8px 8px;
          overflow: hidden;
        }

        .mobile-submenu-scroll {
          max-height: 280px;
          overflow-y: auto;
        }

        .mobile-submenu-featured {
          background: rgba(232, 33, 39, 0.04);
        }

        .mobile-submenu-header {
          display: block;
          padding: 14px 16px;
          font-size: 13px;
          font-weight: 700;
          color: #09090B;
          text-decoration: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .mobile-submenu-item {
          display: block;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #52525B;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .mobile-submenu-item:hover {
          background: rgba(0, 0, 0, 0.04);
          color: #09090B;
        }
      `}</style>
    </>
  );
}
