'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TOP_10_LISTS, TESLA_MODELS, CATEGORIES } from '@/lib/constants';

interface HeaderProps {
  stats?: {
    totalProducts: number;
    totalStores: number;
    discountedCount: number;
  };
  showViewToggle?: boolean;
  viewMode?: 'products' | 'comparisons';
  onViewModeChange?: (mode: 'products' | 'comparisons') => void;
}

export default function Header({
  stats,
  showViewToggle = false,
  viewMode = 'products',
  onViewModeChange
}: HeaderProps) {
  const [showTop10Menu, setShowTop10Menu] = useState(false);
  const [showModelsMenu, setShowModelsMenu] = useState(false);
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link href="/" className="logo">
            EV<span className="logo-accent">PriceHunt</span>
          </Link>

          <nav className="nav">
            {/* Models Dropdown */}
            <div
              className="nav-dropdown"
              onMouseEnter={() => setShowModelsMenu(true)}
              onMouseLeave={() => setShowModelsMenu(false)}
            >
              <button className="nav-btn">
                Models
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {showModelsMenu && (
                <div className="dropdown-menu">
                  <Link href="/model" className="dropdown-item dropdown-item-header">
                    All Models
                  </Link>
                  {TESLA_MODELS.filter(m => m.id !== 'universal').map(model => (
                    <Link
                      key={model.id}
                      href={`/model/${model.id}`}
                      className="dropdown-item"
                    >
                      {model.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Categories Dropdown */}
            <div
              className="nav-dropdown"
              onMouseEnter={() => setShowCategoriesMenu(true)}
              onMouseLeave={() => setShowCategoriesMenu(false)}
            >
              <button className="nav-btn">
                Categories
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {showCategoriesMenu && (
                <div className="dropdown-menu dropdown-menu-wide">
                  <Link href="/category" className="dropdown-item dropdown-item-header">
                    All Categories
                  </Link>
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.id}`}
                      className="dropdown-item"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Top 10 Dropdown */}
            <div
              className="nav-dropdown"
              onMouseEnter={() => setShowTop10Menu(true)}
              onMouseLeave={() => setShowTop10Menu(false)}
            >
              <button className="nav-btn nav-btn-highlight">
                Top 10 Lists
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {showTop10Menu && (
                <div className="dropdown-menu">
                  <Link href="/top-10" className="dropdown-item dropdown-item-header">
                    All Top 10 Lists
                  </Link>
                  {TOP_10_LISTS.map(list => (
                    <Link
                      key={list.id}
                      href={`/top-10/${list.id}`}
                      className="dropdown-item"
                    >
                      {list.title.replace('Best ', '')}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/stores" className="nav-link">
              Stores
            </Link>
          </nav>

          {showViewToggle && onViewModeChange && (
            <div className="view-toggle">
              <button
                onClick={() => onViewModeChange('products')}
                className={`view-toggle-btn ${viewMode === 'products' ? 'active' : ''}`}
              >
                Products
              </button>
              <button
                onClick={() => onViewModeChange('comparisons')}
                className={`view-toggle-btn ${viewMode === 'comparisons' ? 'active' : ''}`}
              >
                Compare Prices
              </button>
            </div>
          )}
        </div>

        {stats && (
          <div className="header-stats">
            <span><strong>{stats.totalProducts.toLocaleString()}</strong> Products</span>
            <span><strong>{stats.totalStores}</strong> Stores</span>
            <span className="stat-highlight"><strong>{stats.discountedCount}</strong> On Sale</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .header {
          background: #0a0a0a;
          padding: 14px 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .logo {
          color: #fff;
          text-decoration: none;
          font-size: 20px;
          font-weight: 700;
        }
        .logo-accent {
          color: #E82127;
        }
        .nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-dropdown {
          position: relative;
        }
        .nav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #d1d5db;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .nav-btn:hover {
          color: #fff;
          background: #1f1f1f;
        }
        .nav-btn-highlight {
          color: #fbbf24;
        }
        .nav-btn-highlight:hover {
          color: #fbbf24;
        }
        .nav-link {
          color: #d1d5db;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .nav-link:hover {
          color: #fff;
          background: #1f1f1f;
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          min-width: 220px;
          padding: 8px 0;
          z-index: 200;
        }
        .dropdown-menu-wide {
          min-width: 260px;
        }
        .dropdown-item {
          display: block;
          padding: 10px 16px;
          color: #374151;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: background 0.15s;
        }
        .dropdown-item:hover {
          background: #f3f4f6;
        }
        .dropdown-item-header {
          font-weight: 600;
          color: #111;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 4px;
        }
        .view-toggle {
          display: flex;
          gap: 4px;
          background: #1f1f1f;
          border-radius: 8px;
          padding: 4px;
        }
        .view-toggle-btn {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          background: transparent;
          color: #fff;
          transition: background 0.2s;
        }
        .view-toggle-btn.active {
          background: #E82127;
        }
        .header-stats {
          display: flex;
          gap: 24px;
          font-size: 13px;
          color: #d1d5db;
        }
        .header-stats strong {
          color: #fff;
        }
        .stat-highlight strong {
          color: #16a34a;
        }
        @media (max-width: 1024px) {
          .nav {
            display: none;
          }
          .header-stats {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
