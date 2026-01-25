'use client';

import { useState, useEffect } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);

  // Close mobile menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileMenuOpen(false);
        setMobileSubmenu(null);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileSubmenu(null);
  };

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-[var(--z-sticky)] bg-gray-900 border-b border-gray-800 backdrop-blur-lg bg-opacity-95">
        <div className="container mx-auto">
          <div className="flex items-center justify-between py-3 md:py-4 gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-4 md:gap-8 flex-1">
              <Link
                href="/"
                className="text-lg md:text-xl font-bold text-white hover:opacity-80 transition-opacity flex-shrink-0"
              >
                EV<span className="text-red-600">PriceHunt</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {/* Models Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowModelsMenu(true)}
                  onMouseLeave={() => setShowModelsMenu(false)}
                >
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                    Models
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {showModelsMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl min-w-[220px] py-2 z-[var(--z-dropdown)] animate-scale-in">
                      <Link href="/model" className="block px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 border-b border-gray-100">
                        All Models
                      </Link>
                      {TESLA_MODELS.filter(m => m.id !== 'universal').map(model => (
                        <Link
                          key={model.id}
                          href={`/model/${model.id}`}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {model.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Categories Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowCategoriesMenu(true)}
                  onMouseLeave={() => setShowCategoriesMenu(false)}
                >
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                    Categories
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {showCategoriesMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl min-w-[260px] py-2 z-[var(--z-dropdown)] animate-scale-in">
                      <Link href="/category" className="block px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 border-b border-gray-100">
                        All Categories
                      </Link>
                      {CATEGORIES.map(cat => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.id}`}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top 10 Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowTop10Menu(true)}
                  onMouseLeave={() => setShowTop10Menu(false)}
                >
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-yellow-400 hover:text-yellow-300 hover:bg-gray-800 rounded-lg transition-all">
                    Top 10 Lists
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {showTop10Menu && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl min-w-[220px] py-2 z-[var(--z-dropdown)] animate-scale-in">
                      <Link href="/top-10" className="block px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 border-b border-gray-100">
                        All Top 10 Lists
                      </Link>
                      {TOP_10_LISTS.map(list => (
                        <Link
                          key={list.id}
                          href={`/top-10/${list.id}`}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {list.title.replace('Best ', '')}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/stores"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                >
                  Stores
                </Link>
              </nav>

              {/* View Toggle */}
              {showViewToggle && onViewModeChange && (
                <div className="hidden md:flex gap-1 bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => onViewModeChange('products')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                      viewMode === 'products'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    Products
                  </button>
                  <button
                    onClick={() => onViewModeChange('comparisons')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                      viewMode === 'comparisons'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    Compare Prices
                  </button>
                </div>
              )}
            </div>

            {/* Stats - Desktop Only */}
            {stats && (
              <div className="hidden xl:flex items-center gap-6 text-sm">
                <span className="text-gray-400">
                  <strong className="text-white font-semibold">{stats.totalProducts.toLocaleString()}</strong> Products
                </span>
                <span className="text-gray-400">
                  <strong className="text-white font-semibold">{stats.totalStores}</strong> Stores
                </span>
                <span className="text-gray-400">
                  <strong className="text-green-500 font-semibold">{stats.discountedCount}</strong> On Sale
                </span>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[var(--z-overlay)] lg:hidden animate-fade-in"
            onClick={closeMobileMenu}
          />
          <nav className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-gray-900 z-[var(--z-modal)] lg:hidden overflow-y-auto animate-slide-in-right">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <Link href="/" className="text-lg font-bold text-white" onClick={closeMobileMenu}>
                EV<span className="text-red-600">PriceHunt</span>
              </Link>
              <button
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Stats */}
            {stats && (
              <div className="flex gap-3 p-4 border-b border-gray-800">
                <div className="flex-1 text-center py-3 bg-gray-800 rounded-lg">
                  <div className="text-lg font-bold text-white">{stats.totalProducts.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">Products</div>
                </div>
                <div className="flex-1 text-center py-3 bg-gray-800 rounded-lg">
                  <div className="text-lg font-bold text-white">{stats.totalStores}</div>
                  <div className="text-xs text-gray-400 mt-1">Stores</div>
                </div>
                <div className="flex-1 text-center py-3 bg-gray-800 rounded-lg">
                  <div className="text-lg font-bold text-green-500">{stats.discountedCount}</div>
                  <div className="text-xs text-gray-400 mt-1">On Sale</div>
                </div>
              </div>
            )}

            {/* Mobile View Toggle */}
            {showViewToggle && onViewModeChange && (
              <div className="flex gap-2 p-4 border-b border-gray-800">
                <button
                  onClick={() => { onViewModeChange('products'); closeMobileMenu(); }}
                  className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
                    viewMode === 'products'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => { onViewModeChange('comparisons'); closeMobileMenu(); }}
                  className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
                    viewMode === 'comparisons'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  Compare
                </button>
              </div>
            )}

            {/* Mobile Navigation */}
            <div className="py-2">
              {/* Models */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-200 hover:bg-gray-800 transition-colors"
                onClick={() => setMobileSubmenu(mobileSubmenu === 'models' ? null : 'models')}
              >
                <span className="font-medium">Tesla Models</span>
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform ${mobileSubmenu === 'models' ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {mobileSubmenu === 'models' && (
                <div className="bg-gray-800/50 border-y border-gray-800">
                  <Link href="/model" onClick={closeMobileMenu} className="block px-6 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                    All Models
                  </Link>
                  {TESLA_MODELS.filter(m => m.id !== 'universal').map(model => (
                    <Link key={model.id} href={`/model/${model.id}`} onClick={closeMobileMenu} className="block px-6 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                      {model.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Categories */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-200 hover:bg-gray-800 transition-colors"
                onClick={() => setMobileSubmenu(mobileSubmenu === 'categories' ? null : 'categories')}
              >
                <span className="font-medium">Categories</span>
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform ${mobileSubmenu === 'categories' ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {mobileSubmenu === 'categories' && (
                <div className="bg-gray-800/50 border-y border-gray-800">
                  <Link href="/category" onClick={closeMobileMenu} className="block px-6 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                    All Categories
                  </Link>
                  {CATEGORIES.map(cat => (
                    <Link key={cat.id} href={`/category/${cat.id}`} onClick={closeMobileMenu} className="block px-6 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Top 10 */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left text-yellow-400 hover:bg-gray-800 transition-colors"
                onClick={() => setMobileSubmenu(mobileSubmenu === 'top10' ? null : 'top10')}
              >
                <span className="font-semibold">Top 10 Lists</span>
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform ${mobileSubmenu === 'top10' ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {mobileSubmenu === 'top10' && (
                <div className="bg-gray-800/50 border-y border-gray-800">
                  <Link href="/top-10" onClick={closeMobileMenu} className="block px-6 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                    All Top 10 Lists
                  </Link>
                  {TOP_10_LISTS.map(list => (
                    <Link key={list.id} href={`/top-10/${list.id}`} onClick={closeMobileMenu} className="block px-6 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                      {list.title.replace('Best ', '')}
                    </Link>
                  ))}
                </div>
              )}

              <Link href="/stores" className="block px-4 py-3 text-gray-200 hover:bg-gray-800 transition-colors" onClick={closeMobileMenu}>
                <span className="font-medium">Partner Stores</span>
              </Link>

              <Link href="/about" className="block px-4 py-3 text-gray-200 hover:bg-gray-800 transition-colors" onClick={closeMobileMenu}>
                <span className="font-medium">About Us</span>
              </Link>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
