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
  const [showModelsMenu, setShowModelsMenu] = useState(false);
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [showTop10Menu, setShowTop10Menu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const modelsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const categoriesTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const top10TimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Enhanced scroll detection for header elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize
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

  // Improved dropdown handlers with delay for better UX
  const handleModelsEnter = () => {
    if (modelsTimeoutRef.current) clearTimeout(modelsTimeoutRef.current);
    setShowModelsMenu(true);
    setShowCategoriesMenu(false);
    setShowTop10Menu(false);
  };

  const handleModelsLeave = () => {
    modelsTimeoutRef.current = setTimeout(() => {
      setShowModelsMenu(false);
    }, 150);
  };

  const handleCategoriesEnter = () => {
    if (categoriesTimeoutRef.current) clearTimeout(categoriesTimeoutRef.current);
    setShowCategoriesMenu(true);
    setShowModelsMenu(false);
    setShowTop10Menu(false);
  };

  const handleCategoriesLeave = () => {
    categoriesTimeoutRef.current = setTimeout(() => {
      setShowCategoriesMenu(false);
    }, 150);
  };

  const handleTop10Enter = () => {
    if (top10TimeoutRef.current) clearTimeout(top10TimeoutRef.current);
    setShowTop10Menu(true);
    setShowModelsMenu(false);
    setShowCategoriesMenu(false);
  };

  const handleTop10Leave = () => {
    top10TimeoutRef.current = setTimeout(() => {
      setShowTop10Menu(false);
    }, 150);
  };

  return (
    <>
      {/* Main Header - Professional E-commerce Grade */}
      <header
        className={`fixed top-0 left-0 right-0 z-[var(--z-sticky)] transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-md border-b border-gray-200'
            : 'bg-white border-b border-gray-200'
        }`}
        style={{ height: 'var(--header-height)' }}
      >
        <div className="container mx-auto h-full">
          <div className="flex items-center justify-between h-full gap-6">

            {/* Logo & Primary Navigation */}
            <div className="flex items-center gap-8 flex-1">
              {/* Logo - Enhanced branding */}
              <Link
                href="/"
                className="flex items-center gap-2 group"
              >
                <div className="relative">
                  <span className="text-2xl font-extrabold tracking-tight text-gray-900 transition-transform group-hover:scale-105">
                    EV<span className="text-tesla-red">PriceHunt</span>
                  </span>
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-tesla-red to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>

              {/* Desktop Navigation - Professional styling */}
              <nav className="hidden lg:flex items-center gap-1">

                {/* Models Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={handleModelsEnter}
                  onMouseLeave={handleModelsLeave}
                >
                  <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all group">
                    <span>Models</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className={`transition-transform ${showModelsMenu ? 'rotate-180' : ''}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {showModelsMenu && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 min-w-[240px] py-2 animate-scale-in overflow-hidden">
                      <Link
                        href="/model"
                        className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                      >
                        <span>All Models</span>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M5 12l5-5 5 5" />
                        </svg>
                      </Link>
                      <div className="py-1">
                        {TESLA_MODELS.filter(m => m.id !== 'universal').map((model, idx) => (
                          <Link
                            key={model.id}
                            href={`/model/${model.id}`}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            style={{ animationDelay: `${idx * 30}ms` }}
                          >
                            <span className="font-medium">{model.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Categories Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={handleCategoriesEnter}
                  onMouseLeave={handleCategoriesLeave}
                >
                  <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
                    <span>Categories</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className={`transition-transform ${showCategoriesMenu ? 'rotate-180' : ''}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {showCategoriesMenu && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 min-w-[280px] max-h-[480px] overflow-y-auto py-2 animate-scale-in">
                      <Link
                        href="/category"
                        className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 border-b border-gray-100 transition-colors sticky top-0 bg-white z-10"
                      >
                        <span>All Categories</span>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 7h18M3 12h18M3 17h18" />
                        </svg>
                      </Link>
                      <div className="py-1">
                        {CATEGORIES.map((cat, idx) => (
                          <Link
                            key={cat.id}
                            href={`/category/${cat.id}`}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            style={{ animationDelay: `${idx * 20}ms` }}
                          >
                            <div className="font-medium">{cat.name}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Top 10 Dropdown - Featured */}
                <div
                  className="relative"
                  onMouseEnter={handleTop10Enter}
                  onMouseLeave={handleTop10Leave}
                >
                  <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-tesla-red hover:text-tesla-red-hover hover:bg-red-50 rounded-lg transition-all">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>Top 10 Lists</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className={`transition-transform ${showTop10Menu ? 'rotate-180' : ''}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {showTop10Menu && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 min-w-[300px] py-2 animate-scale-in overflow-hidden">
                      <Link
                        href="/top-10"
                        className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-red-50 border-b border-gray-100 transition-colors"
                      >
                        <span>All Top 10 Lists</span>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <div className="py-1">
                        {TOP_10_LISTS.map((list, idx) => (
                          <Link
                            key={list.id}
                            href={`/top-10/${list.id}`}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-red-50 transition-colors"
                            style={{ animationDelay: `${idx * 30}ms` }}
                          >
                            <div className="font-medium">{list.title.replace('Best ', '')}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/stores"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                >
                  Stores
                </Link>
              </nav>

              {/* View Toggle - Enhanced styling */}
              {showViewToggle && onViewModeChange && (
                <div className="hidden md:flex gap-0.5 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => onViewModeChange('products')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                      viewMode === 'products'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Products
                  </button>
                  <button
                    onClick={() => onViewModeChange('comparisons')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                      viewMode === 'comparisons'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Compare Prices
                  </button>
                </div>
              )}
            </div>

            {/* Stats - Premium design */}
            {stats && (
              <div className="hidden xl:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-gray-600">
                    <strong className="text-gray-900 font-semibold">{stats.totalProducts.toLocaleString()}</strong> Products
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-gray-600">
                    <strong className="text-gray-900 font-semibold">{stats.totalStores}</strong> Stores
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-gray-600">
                    <strong className="text-green-600 font-semibold">{stats.discountedCount}</strong> On Sale
                  </span>
                </div>
              </div>
            )}

            {/* Mobile Menu Button - Enhanced */}
            <button
              className="lg:hidden p-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div style={{ height: 'var(--header-height)' }} />

      {/* Mobile Menu - Professional overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-[var(--z-overlay)] lg:hidden backdrop-blur-sm animate-fade-in"
            onClick={closeMobileMenu}
          />

          {/* Mobile Menu Panel */}
          <nav className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-[var(--z-modal)] lg:hidden overflow-y-auto shadow-2xl animate-slide-in-right">

            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <Link href="/" className="text-xl font-extrabold text-gray-900" onClick={closeMobileMenu}>
                EV<span className="text-tesla-red">PriceHunt</span>
              </Link>
              <button
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Stats - Card design */}
            {stats && (
              <div className="grid grid-cols-3 gap-2 p-4 border-b border-gray-200 bg-gray-50">
                <div className="text-center py-3 bg-white rounded-lg border border-gray-200">
                  <div className="text-lg font-bold text-gray-900">{stats.totalProducts.toLocaleString()}</div>
                  <div className="text-xs text-gray-600 mt-0.5">Products</div>
                </div>
                <div className="text-center py-3 bg-white rounded-lg border border-gray-200">
                  <div className="text-lg font-bold text-gray-900">{stats.totalStores}</div>
                  <div className="text-xs text-gray-600 mt-0.5">Stores</div>
                </div>
                <div className="text-center py-3 bg-white rounded-lg border border-green-200 bg-green-50">
                  <div className="text-lg font-bold text-green-600">{stats.discountedCount}</div>
                  <div className="text-xs text-gray-600 mt-0.5">On Sale</div>
                </div>
              </div>
            )}

            {/* Mobile View Toggle */}
            {showViewToggle && onViewModeChange && (
              <div className="flex gap-2 p-4 border-b border-gray-200 bg-gray-50">
                <button
                  onClick={() => { onViewModeChange('products'); closeMobileMenu(); }}
                  className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
                    viewMode === 'products'
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => { onViewModeChange('comparisons'); closeMobileMenu(); }}
                  className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
                    viewMode === 'comparisons'
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Compare
                </button>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="py-2">

              {/* Models */}
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 text-left text-gray-900 hover:bg-gray-50 transition-colors font-medium"
                onClick={() => setMobileSubmenu(mobileSubmenu === 'models' ? null : 'models')}
              >
                <span>Tesla Models</span>
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={`transition-transform ${mobileSubmenu === 'models' ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {mobileSubmenu === 'models' && (
                <div className="bg-gray-50 border-y border-gray-200">
                  <Link href="/model" onClick={closeMobileMenu} className="block px-6 py-3 text-sm font-medium text-gray-900 hover:bg-white transition-colors border-b border-gray-200">
                    All Models
                  </Link>
                  {TESLA_MODELS.filter(m => m.id !== 'universal').map(model => (
                    <Link
                      key={model.id}
                      href={`/model/${model.id}`}
                      onClick={closeMobileMenu}
                      className="block px-6 py-3 text-sm text-gray-700 hover:text-gray-900 hover:bg-white transition-colors"
                    >
                      {model.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Categories */}
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 text-left text-gray-900 hover:bg-gray-50 transition-colors font-medium"
                onClick={() => setMobileSubmenu(mobileSubmenu === 'categories' ? null : 'categories')}
              >
                <span>Categories</span>
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={`transition-transform ${mobileSubmenu === 'categories' ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {mobileSubmenu === 'categories' && (
                <div className="bg-gray-50 border-y border-gray-200 max-h-[300px] overflow-y-auto">
                  <Link href="/category" onClick={closeMobileMenu} className="block px-6 py-3 text-sm font-medium text-gray-900 hover:bg-white transition-colors border-b border-gray-200 sticky top-0 bg-gray-50">
                    All Categories
                  </Link>
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.id}`}
                      onClick={closeMobileMenu}
                      className="block px-6 py-3 text-sm text-gray-700 hover:text-gray-900 hover:bg-white transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Top 10 */}
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 text-left text-tesla-red hover:bg-red-50 transition-colors font-semibold"
                onClick={() => setMobileSubmenu(mobileSubmenu === 'top10' ? null : 'top10')}
              >
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>Top 10 Lists</span>
                </div>
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={`transition-transform ${mobileSubmenu === 'top10' ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {mobileSubmenu === 'top10' && (
                <div className="bg-red-50 border-y border-red-200">
                  <Link href="/top-10" onClick={closeMobileMenu} className="block px-6 py-3 text-sm font-medium text-gray-900 hover:bg-white transition-colors border-b border-red-200">
                    All Top 10 Lists
                  </Link>
                  {TOP_10_LISTS.map(list => (
                    <Link
                      key={list.id}
                      href={`/top-10/${list.id}`}
                      onClick={closeMobileMenu}
                      className="block px-6 py-3 text-sm text-gray-700 hover:text-gray-900 hover:bg-white transition-colors"
                    >
                      {list.title.replace('Best ', '')}
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href="/stores"
                className="block px-4 py-3.5 text-gray-900 hover:bg-gray-50 transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Partner Stores
              </Link>

              <Link
                href="/about"
                className="block px-4 py-3.5 text-gray-900 hover:bg-gray-50 transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                About Us
              </Link>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
