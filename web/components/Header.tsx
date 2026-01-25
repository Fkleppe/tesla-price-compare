'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TOP_10_LISTS, TESLA_MODELS, CATEGORIES } from '@/lib/constants';

interface HeaderProps {
  stats?: {
    totalProducts: number;
    totalStores: number;
    discountedCount: number;
  };
}

export default function Header({ stats }: HeaderProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 834) {
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

  const handleEnter = (menu: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  };

  const closeMenu = () => {
    setActiveMenu(null);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileSubmenu(null);
  };

  const handleLinkClick = (href: string) => {
    closeMenu();
    router.push(href);
  };

  return (
    <>
      <header className="header">
        <nav className="nav">
          <Link href="/" className="logo" onClick={closeMenu}>
            EV<span>PriceHunt</span>
          </Link>

          <div className="nav-center">
            <button
              className={`nav-btn ${activeMenu === 'models' ? 'active' : ''}`}
              onMouseEnter={() => handleEnter('models')}
              onMouseLeave={handleLeave}
              onClick={() => setActiveMenu(activeMenu === 'models' ? null : 'models')}
              aria-expanded={activeMenu === 'models'}
              aria-haspopup="true"
            >
              Models
            </button>

            <button
              className={`nav-btn ${activeMenu === 'categories' ? 'active' : ''}`}
              onMouseEnter={() => handleEnter('categories')}
              onMouseLeave={handleLeave}
              onClick={() => setActiveMenu(activeMenu === 'categories' ? null : 'categories')}
              aria-expanded={activeMenu === 'categories'}
              aria-haspopup="true"
            >
              Categories
            </button>

            <button
              className={`nav-btn ${activeMenu === 'top10' ? 'active' : ''}`}
              onMouseEnter={() => handleEnter('top10')}
              onMouseLeave={handleLeave}
              onClick={() => setActiveMenu(activeMenu === 'top10' ? null : 'top10')}
              aria-expanded={activeMenu === 'top10'}
              aria-haspopup="true"
            >
              Top 10
            </button>

            <Link href="/stores" className="nav-link" onClick={closeMenu}>Stores</Link>
            <Link href="/compare" className="nav-link" onClick={closeMenu}>Compare</Link>
          </div>

          {stats && (
            <div className="stats">
              <span>{stats.totalProducts.toLocaleString()} products</span>
              <span className="dot">·</span>
              <span>{stats.totalStores} stores</span>
              {stats.discountedCount > 0 && (
                <>
                  <span className="dot">·</span>
                  <span className="sale">{stats.discountedCount} on sale</span>
                </>
              )}
            </div>
          )}

          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              {mobileMenuOpen ? (
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              ) : (
                <>
                  <line x1="2" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </>
              )}
            </svg>
          </button>
        </nav>
      </header>

      {/* Mega Menu */}
      {activeMenu && (
        <div
          className="mega-menu"
          onMouseEnter={() => handleEnter(activeMenu)}
          onMouseLeave={handleLeave}
          role="menu"
        >
          <div className="mega-inner">
            {activeMenu === 'models' && (
              <>
                <div className="mega-grid mega-grid-models">
                  {TESLA_MODELS.filter(m => m.id !== 'universal').map((model) => (
                    <button
                      key={model.id}
                      className="mega-card"
                      onClick={() => handleLinkClick(`/model/${model.id}`)}
                      role="menuitem"
                    >
                      <span className="mega-card-name">{model.name}</span>
                      <span className="mega-card-sub">View accessories</span>
                    </button>
                  ))}
                </div>
                <button className="mega-link" onClick={() => handleLinkClick('/model')}>
                  Browse all models →
                </button>
              </>
            )}

            {activeMenu === 'categories' && (
              <>
                <div className="mega-grid mega-grid-categories">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      className="mega-item"
                      onClick={() => handleLinkClick(`/category/${cat.id}`)}
                      role="menuitem"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                <button className="mega-link" onClick={() => handleLinkClick('/category')}>
                  All categories →
                </button>
              </>
            )}

            {activeMenu === 'top10' && (
              <>
                <div className="mega-grid mega-grid-top10">
                  {TOP_10_LISTS.map((list) => (
                    <button
                      key={list.id}
                      className="mega-item"
                      onClick={() => handleLinkClick(`/top-10/${list.id}`)}
                      role="menuitem"
                    >
                      {list.title}
                    </button>
                  ))}
                </div>
                <button className="mega-link" onClick={() => handleLinkClick('/top-10')}>
                  All top 10 lists →
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="header-spacer" />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-backdrop" onClick={closeMobileMenu} />
          <div className="mobile-menu" role="menu">
            <div className="mobile-section">
              <button
                className={`mobile-btn ${mobileSubmenu === 'models' ? 'open' : ''}`}
                onClick={() => setMobileSubmenu(mobileSubmenu === 'models' ? null : 'models')}
                aria-expanded={mobileSubmenu === 'models'}
              >
                Models
              </button>
              {mobileSubmenu === 'models' && (
                <div className="mobile-dropdown">
                  {TESLA_MODELS.filter(m => m.id !== 'universal').map(m => (
                    <Link key={m.id} href={`/model/${m.id}`} onClick={closeMobileMenu}>
                      {m.name}
                    </Link>
                  ))}
                  <Link href="/model" onClick={closeMobileMenu} className="mobile-all">
                    All models
                  </Link>
                </div>
              )}
            </div>

            <div className="mobile-section">
              <button
                className={`mobile-btn ${mobileSubmenu === 'categories' ? 'open' : ''}`}
                onClick={() => setMobileSubmenu(mobileSubmenu === 'categories' ? null : 'categories')}
                aria-expanded={mobileSubmenu === 'categories'}
              >
                Categories
              </button>
              {mobileSubmenu === 'categories' && (
                <div className="mobile-dropdown mobile-dropdown-scroll">
                  {CATEGORIES.map(c => (
                    <Link key={c.id} href={`/category/${c.id}`} onClick={closeMobileMenu}>
                      {c.name}
                    </Link>
                  ))}
                  <Link href="/category" onClick={closeMobileMenu} className="mobile-all">
                    All categories
                  </Link>
                </div>
              )}
            </div>

            <div className="mobile-section">
              <button
                className={`mobile-btn ${mobileSubmenu === 'top10' ? 'open' : ''}`}
                onClick={() => setMobileSubmenu(mobileSubmenu === 'top10' ? null : 'top10')}
                aria-expanded={mobileSubmenu === 'top10'}
              >
                Top 10
              </button>
              {mobileSubmenu === 'top10' && (
                <div className="mobile-dropdown">
                  {TOP_10_LISTS.map(l => (
                    <Link key={l.id} href={`/top-10/${l.id}`} onClick={closeMobileMenu}>
                      {l.title}
                    </Link>
                  ))}
                  <Link href="/top-10" onClick={closeMobileMenu} className="mobile-all">
                    All lists
                  </Link>
                </div>
              )}
            </div>

            <div className="mobile-divider" />

            <Link href="/stores" className="mobile-link" onClick={closeMobileMenu}>
              Stores
            </Link>
            <Link href="/compare" className="mobile-link" onClick={closeMobileMenu}>
              Compare
            </Link>

            {stats && (
              <div className="mobile-footer">
                {stats.totalProducts.toLocaleString()} products from {stats.totalStores} stores
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 48px;
          background: rgba(22, 22, 23, 0.95);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          z-index: 9000;
        }

        .nav {
          max-width: 980px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
        }

        .header-spacer {
          height: 48px;
        }

        .logo {
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #f5f5f7;
          text-decoration: none;
          flex-shrink: 0;
        }

        .logo span {
          color: #E82127;
        }

        .nav-center {
          display: none;
          align-items: center;
          gap: 28px;
        }

        @media (min-width: 834px) {
          .nav-center { display: flex; }
        }

        .nav-btn {
          font-size: 13px;
          font-weight: 400;
          color: rgba(245, 245, 247, 0.8);
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 4px;
          transition: color 0.2s;
        }

        .nav-btn:hover,
        .nav-btn.active {
          color: #f5f5f7;
        }

        .nav-link {
          font-size: 13px;
          font-weight: 400;
          color: rgba(245, 245, 247, 0.8);
          text-decoration: none;
          padding: 6px 4px;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: #f5f5f7;
        }

        .stats {
          display: none;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: rgba(245, 245, 247, 0.5);
        }

        @media (min-width: 1080px) {
          .stats { display: flex; }
        }

        .dot { opacity: 0.5; }
        .sale { color: #32d74b; }

        .mobile-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          margin-right: -12px;
          background: none;
          border: none;
          color: #f5f5f7;
          cursor: pointer;
        }

        @media (min-width: 834px) {
          .mobile-toggle { display: none; }
        }

        /* Mega Menu */
        .mega-menu {
          position: fixed;
          top: 48px;
          left: 0;
          right: 0;
          background: rgba(22, 22, 23, 0.98);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 8999;
          animation: menuIn 0.2s ease;
        }

        @keyframes menuIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mega-inner {
          max-width: 980px;
          margin: 0 auto;
          padding: 32px 24px 36px;
        }

        .mega-grid {
          display: grid;
          gap: 8px;
        }

        .mega-grid-models {
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          max-width: 640px;
        }

        .mega-grid-categories {
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        }

        .mega-grid-top10 {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }

        .mega-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.04);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s;
        }

        .mega-card:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .mega-card-name {
          font-size: 14px;
          font-weight: 500;
          color: #f5f5f7;
        }

        .mega-card-sub {
          font-size: 11px;
          color: rgba(245, 245, 247, 0.5);
        }

        .mega-item {
          display: block;
          padding: 10px 14px;
          font-size: 13px;
          color: rgba(245, 245, 247, 0.85);
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: background 0.15s, color 0.15s;
        }

        .mega-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #f5f5f7;
        }

        .mega-link {
          display: inline-block;
          margin-top: 20px;
          padding: 8px 0;
          font-size: 13px;
          color: #2997ff;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.15s;
        }

        .mega-link:hover {
          color: #6cb6ff;
        }

        /* Mobile */
        .mobile-backdrop {
          position: fixed;
          inset: 48px 0 0 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 8998;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .mobile-menu {
          position: fixed;
          top: 48px;
          left: 0;
          right: 0;
          bottom: 0;
          background: #161617;
          z-index: 8999;
          overflow-y: auto;
          padding: 8px 0 32px;
          animation: slideDown 0.25s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mobile-section {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .mobile-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 16px 24px;
          font-size: 17px;
          font-weight: 500;
          color: #f5f5f7;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .mobile-btn::after {
          content: '+';
          font-size: 22px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.4);
        }

        .mobile-btn.open::after {
          content: '−';
        }

        .mobile-dropdown {
          padding: 0 24px 12px;
        }

        .mobile-dropdown-scroll {
          max-height: 320px;
          overflow-y: auto;
        }

        .mobile-dropdown :global(a) {
          display: block;
          padding: 12px 0;
          font-size: 15px;
          color: rgba(245, 245, 247, 0.7);
          text-decoration: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .mobile-dropdown :global(a:last-child) {
          border-bottom: none;
        }

        .mobile-dropdown :global(a.mobile-all) {
          color: #2997ff;
          border-bottom: none;
          padding-top: 16px;
          font-weight: 500;
        }

        .mobile-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          margin: 8px 0;
        }

        .mobile-link {
          display: block;
          padding: 16px 24px;
          font-size: 17px;
          font-weight: 500;
          color: #f5f5f7;
          text-decoration: none;
        }

        .mobile-footer {
          margin-top: 24px;
          padding: 0 24px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.35);
        }
      `}</style>
    </>
  );
}
