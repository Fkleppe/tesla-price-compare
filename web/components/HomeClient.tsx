'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAffiliateUrl, getDiscountInfo, isAffiliatePartner } from '../lib/affiliate';
import { Product, ProductMatch, PaginatedResponse, PaginationMeta } from '../lib/types';
import { useProducts } from '../lib/hooks/useProducts';
import ProductSkeleton from './ProductSkeleton';

interface HomeClientProps {
  initialProducts: Product[];
  initialMatches: ProductMatch[];
  stats: {
    totalProducts: number;
    totalStores: number;
    totalMatches: number;
    maxPrice: number;
    models: string[];
    categories: string[];
    sources: string[];
  };
  initialMeta: PaginationMeta;
}

const MODEL_LABELS: Record<string, string> = {
  'all': 'All Models',
  'model-3': 'Model 3',
  'highland': 'Model 3 Highland',
  'model-y': 'Model Y',
  'juniper': 'Model Y Juniper',
  'model-s': 'Model S',
  'model-x': 'Model X',
  'cybertruck': 'Cybertruck',
  'universal': 'Universal',
};

type ViewMode = 'products' | 'comparisons';
type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'discount-desc' | 'newest';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

const ITEMS_PER_PAGE = 48;

export default function HomeClient({ initialProducts, initialMatches, stats, initialMeta }: HomeClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('products');
  const [selectedMatch, setSelectedMatch] = useState<ProductMatch | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(5000);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [page, setPage] = useState(1);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-hide filters on mobile
      if (mobile) {
        setShowFilters(false);
      } else {
        setShowFilters(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when mobile filter is open
  useEffect(() => {
    if (isMobile && showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, showFilters]);

  // Build fallback data for SWR
  const fallbackData: PaginatedResponse<Product> = useMemo(() => ({
    products: initialProducts,
    meta: initialMeta,
  }), [initialProducts, initialMeta]);

  // Use SWR hook for server-side filtering
  const { products, meta, isLoading, isValidating, error } = useProducts(
    {
      page,
      limit: ITEMS_PER_PAGE,
      models: selectedModels,
      categories: selectedCategories,
      sources: selectedSources,
      priceMin,
      priceMax,
      search: searchQuery,
      sort: sortBy,
      onlyDiscounted,
    },
    fallbackData
  );

  // Calculate discounted count from stats (approximation)
  const discountedCount = useMemo(() => {
    return initialProducts.filter(p => getDiscountInfo(p.url) !== null).length;
  }, [initialProducts]);

  // Filtered matches (still client-side for comparisons view)
  const filteredMatches = useMemo(() => {
    let filtered = initialMatches.map(m => ({
      ...m,
      products: m.products.filter(p => isAffiliatePartner(p.url))
    })).filter(m => m.products.length >= 2);

    filtered = filtered.map(m => {
      const prices = m.products.map(p => p.price);
      const lowestPrice = Math.min(...prices);
      const highestPrice = Math.max(...prices);
      return {
        ...m,
        lowestPrice,
        highestPrice,
        savings: highestPrice - lowestPrice,
        savingsPercent: Math.round(((highestPrice - lowestPrice) / highestPrice) * 100)
      };
    });

    if (selectedModels.length > 0) {
      filtered = filtered.filter(m => m.models?.some(mod => selectedModels.includes(mod)));
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(m => selectedCategories.includes(m.category));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m => m.products?.some(p => p.title?.toLowerCase().includes(q)));
    }

    return [...filtered].sort((a, b) => b.savingsPercent - a.savingsPercent);
  }, [initialMatches, selectedModels, selectedCategories, searchQuery]);

  const totalPages = meta?.totalPages || 1;
  const totalProducts = meta?.total || 0;

  const formatCategory = (cat: string) => cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const clearFilters = () => {
    setSelectedModels([]);
    setSelectedCategories([]);
    setSelectedSources([]);
    setPriceMin(0);
    setPriceMax(5000);
    setOnlyDiscounted(false);
    setSearchQuery('');
    setPage(1);
  };

  const toggleModel = (model: string) => {
    setSelectedModels(prev =>
      prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]
    );
    setPage(1);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setPage(1);
  };

  const toggleSource = (source: string) => {
    setSelectedSources(prev =>
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
    setPage(1);
  };

  const activeFiltersCount = selectedModels.length + selectedCategories.length + selectedSources.length + (onlyDiscounted ? 1 : 0) + (priceMin > 0 || priceMax < 5000 ? 1 : 0);

  const showLoadingState = isLoading || (isValidating && products.length === 0);

  const closeMobileFilters = () => {
    if (isMobile) {
      setShowFilters(false);
    }
  };

  return (
    <div className="home-container">
      {/* View Toggle Bar */}
      <div className="view-toggle-bar">
        <div className="view-toggle">
          <button
            onClick={() => { setViewMode('products'); setPage(1); }}
            className={`toggle-btn ${viewMode === 'products' ? 'active' : ''}`}
          >
            Products ({totalProducts.toLocaleString()})
          </button>
          <button
            onClick={() => setViewMode('comparisons')}
            className={`toggle-btn ${viewMode === 'comparisons' ? 'active' : ''}`}
          >
            Compare ({filteredMatches.length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <div className="search-inner">
          <div className="search-row">
            <div className="search-input-wrap">
              <input
                type="text"
                placeholder="Search Tesla accessories..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                className="search-input"
              />
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {isValidating && <div className="search-spinner" role="status" aria-label="Loading" />}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              className={`filter-btn ${showFilters ? 'active' : ''}`}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="filter-btn-text">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="filter-badge">{activeFiltersCount}</span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value as SortOption); setPage(1); }}
              className="sort-select"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount-desc">Biggest Discount</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Mobile Filter Overlay */}
        {isMobile && showFilters && (
          <div className="filter-overlay" onClick={() => setShowFilters(false)} />
        )}

        {/* Sidebar Filters */}
        {showFilters && (
          <aside className={`filter-sidebar ${isMobile ? 'mobile' : ''}`}>
            <div className="filter-container">
              {/* Filter Header */}
              <div className="filter-header">
                <span className="filter-title">Filters</span>
                <div className="filter-header-actions">
                  {activeFiltersCount > 0 && (
                    <button onClick={clearFilters} className="clear-filters-btn">
                      Clear All
                    </button>
                  )}
                  {isMobile && (
                    <button onClick={() => setShowFilters(false)} className="close-filters-btn" aria-label="Close filters">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Discount Toggle */}
              <div className="filter-section">
                <label className="discount-toggle">
                  <input
                    type="checkbox"
                    checked={onlyDiscounted}
                    onChange={e => { setOnlyDiscounted(e.target.checked); setPage(1); }}
                  />
                  <span className="discount-label">On Sale Only</span>
                  <span className="discount-count">{discountedCount}</span>
                </label>
              </div>

              {/* Price Range */}
              <div className="filter-section">
                <div className="filter-section-title">Price Range</div>
                <div className="price-inputs">
                  <div className="price-input-group">
                    <label>Min</label>
                    <input
                      type="number"
                      value={priceMin}
                      onChange={e => { setPriceMin(Number(e.target.value)); setPage(1); }}
                      min={0}
                    />
                  </div>
                  <div className="price-input-group">
                    <label>Max</label>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={e => { setPriceMax(Number(e.target.value)); setPage(1); }}
                      min={0}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={stats.maxPrice || 5000}
                  value={priceMax}
                  onChange={e => { setPriceMax(Number(e.target.value)); setPage(1); }}
                  className="price-slider"
                />
                <div className="price-range-labels">
                  <span>$0</span>
                  <span>${stats.maxPrice?.toLocaleString() || '5,000'}</span>
                </div>
              </div>

              {/* Tesla Models */}
              <div className="filter-section">
                <div className="filter-section-title">Tesla Model</div>
                <div className="filter-options">
                  {stats.models.map(model => (
                    <label key={model} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model)}
                        onChange={() => toggleModel(model)}
                      />
                      <span>{MODEL_LABELS[model] || model}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="filter-section filter-section-scroll">
                <div className="filter-section-title">Category</div>
                <div className="filter-options">
                  {stats.categories.map(cat => (
                    <label key={cat} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                      <span>{formatCategory(cat)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stores */}
              <div className="filter-section">
                <div className="filter-section-title">Store</div>
                <div className="filter-options">
                  {stats.sources.map(source => (
                    <label key={source} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedSources.includes(source)}
                        onChange={() => toggleSource(source)}
                      />
                      <span>{source}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Apply Button */}
              {isMobile && (
                <div className="filter-apply-section">
                  <button onClick={closeMobileFilters} className="filter-apply-btn">
                    Show {totalProducts.toLocaleString()} Results
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className={`products-main ${showFilters && !isMobile ? 'with-sidebar' : ''}`}>
          {/* Active Filters & Results Count */}
          <div className="results-header">
            <div className="results-info">
              <span className="results-count">
                <strong>{totalProducts.toLocaleString()}</strong> products
              </span>

              {/* Active Filter Pills */}
              <div className="filter-pills">
                {selectedModels.map(m => (
                  <span key={m} className="pill pill-red">
                    {MODEL_LABELS[m] || m}
                    <button onClick={() => toggleModel(m)}>×</button>
                  </span>
                ))}
                {selectedCategories.map(c => (
                  <span key={c} className="pill pill-yellow">
                    {formatCategory(c)}
                    <button onClick={() => toggleCategory(c)}>×</button>
                  </span>
                ))}
                {selectedSources.map(s => (
                  <span key={s} className="pill pill-blue">
                    {s}
                    <button onClick={() => toggleSource(s)}>×</button>
                  </span>
                ))}
                {onlyDiscounted && (
                  <span className="pill pill-green">
                    On Sale
                    <button onClick={() => setOnlyDiscounted(false)}>×</button>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {viewMode === 'products' && (
            <>
              {error ? (
                <div className="error-state">
                  <h3>Failed to load products</h3>
                  <p>Please try refreshing the page.</p>
                  <button onClick={() => window.location.reload()}>Refresh Page</button>
                </div>
              ) : showLoadingState ? (
                <ProductSkeleton count={ITEMS_PER_PAGE} showFilters={showFilters && !isMobile} />
              ) : (
                <div className={`products-grid ${isValidating ? 'loading' : ''}`}>
                  {products.map((p, idx) => {
                    const discount = getDiscountInfo(p.url);
                    const affiliateUrl = getAffiliateUrl(p.url);
                    return (
                      <div key={`${p.url}-${idx}`} className="product-card">
                        <Link href={`/product/${generateSlug(p.title)}`} className="product-link">
                          <div className="product-image-wrap">
                            {p.image && (
                              <Image
                                src={p.image}
                                alt={p.title}
                                fill
                                sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                style={{ objectFit: 'cover' }}
                                loading={idx < 8 ? 'eager' : 'lazy'}
                              />
                            )}
                            {discount && (
                              <div className="discount-badge">{discount.percent}% OFF</div>
                            )}
                          </div>
                          <div className="product-info">
                            <div className="product-meta">
                              <span>{p.source}</span>
                              {p.models?.filter(m => m !== 'universal').slice(0, 1).map(m => (
                                <span key={m} className="product-model">{MODEL_LABELS[m]?.split(' ')[1] || m}</span>
                              ))}
                            </div>
                            <h3 className="product-title">{p.title}</h3>
                            <div className="product-price">
                              <span className="price-regular">${p.price.toFixed(0)}</span>
                              {discount && (
                                <span className="price-with-code">
                                  ${(p.price * (1 - discount.percent / 100)).toFixed(0)} with code
                                </span>
                              )}
                            </div>
                            {discount && (
                              <div className="discount-code">
                                <span className="code">{discount.code}</span>
                                <span className="discount-percent">-{discount.percent}%</span>
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="product-action">
                          <a href={affiliateUrl} target="_blank" rel="noopener noreferrer" className="buy-btn">
                            Visit {p.source} →
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="page-btn"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="page-btn"
                  >
                    ← Prev
                  </button>
                  <div className="page-current">{page} / {totalPages}</div>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="page-btn"
                  >
                    Next →
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="page-btn"
                  >
                    Last
                  </button>
                </div>
              )}
            </>
          )}

          {/* Comparisons View */}
          {viewMode === 'comparisons' && (
            <div className="comparisons-grid">
              {filteredMatches.map((match) => (
                <article
                  key={match.matchKey}
                  onClick={() => setSelectedMatch(match)}
                  className="comparison-card"
                >
                  {match.products[0]?.image && (
                    <div className="comparison-image">
                      <Image
                        src={match.products[0].image}
                        alt={match.products[0].title}
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="savings-badge">Save {match.savingsPercent}%</div>
                    </div>
                  )}
                  <div className="comparison-info">
                    <div className="store-count">{match.products.length} stores</div>
                    <h3 className="comparison-title">{match.products[0]?.title}</h3>
                    <div className="comparison-prices">
                      <div>
                        <span className="price-label">Best price</span>
                        <div className="best-price">${match.lowestPrice.toFixed(0)}</div>
                      </div>
                      <div className="savings-info">
                        <span className="price-label">You save</span>
                        <div className="savings-amount">${match.savings.toFixed(0)}</div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {selectedMatch && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedMatch(null)} />
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>{selectedMatch.products[0]?.title}</h2>
                <p>{selectedMatch.products.length} stores compared</p>
              </div>
              <button onClick={() => setSelectedMatch(null)} className="modal-close">×</button>
            </div>
            <div className="modal-stats">
              <div className="modal-stat">
                <span>Best Price</span>
                <strong className="green">${selectedMatch.lowestPrice.toFixed(0)}</strong>
              </div>
              <div className="modal-stat">
                <span>Highest</span>
                <strong>${selectedMatch.highestPrice.toFixed(0)}</strong>
              </div>
              <div className="modal-stat">
                <span>You Save</span>
                <strong className="red">${selectedMatch.savings.toFixed(0)}</strong>
              </div>
            </div>
            <div className="modal-body">
              {selectedMatch.products.sort((a, b) => a.price - b.price).map((p, i) => {
                const discountInfo = getDiscountInfo(p.url);
                const affiliateUrl = getAffiliateUrl(p.url);

                return (
                  <div key={i} className={`store-row ${i === 0 ? 'best' : ''}`}>
                    {p.image && (
                      <div className="store-image">
                        <Image src={p.image} alt={p.title} fill sizes="64px" style={{ objectFit: 'cover' }} />
                      </div>
                    )}
                    <div className="store-info">
                      <div className="store-header">
                        <div className="store-name">
                          <span>{p.source}</span>
                          {i === 0 && <span className="best-badge">BEST PRICE</span>}
                        </div>
                        <span className={`store-price ${i === 0 ? 'green' : ''}`}>${p.price.toFixed(2)}</span>
                      </div>
                      {discountInfo && (
                        <div className="store-discount">
                          <span>Extra {discountInfo.percent}% off with code:</span>
                          <span className="code">{discountInfo.code}</span>
                        </div>
                      )}
                    </div>
                    <a href={affiliateUrl} target="_blank" rel="noopener noreferrer" className={`store-btn ${i === 0 ? 'green' : ''}`}>
                      Visit →
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .home-container {
          min-height: 100vh;
          background: #f8f9fa;
        }

        /* View Toggle Bar */
        .view-toggle-bar {
          display: flex;
          justify-content: center;
          padding: 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        .view-toggle {
          display: flex;
          gap: 4px;
          background: #1f1f1f;
          border-radius: 8px;
          padding: 4px;
        }
        .toggle-btn {
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          background: transparent;
          color: #fff;
          transition: background 0.2s;
          min-height: 40px;
        }
        .toggle-btn.active { background: #E82127; }

        /* Search Bar */
        .search-bar {
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          padding: 12px 0;
        }
        .search-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .search-row {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .search-input-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
        }
        .search-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          font-size: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          background: #fff;
          outline: none;
          min-height: 48px;
        }
        .search-input:focus { border-color: #9ca3af; }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #9ca3af;
        }
        .search-spinner {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top-color: #E82127;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 500;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          background: #fff;
          cursor: pointer;
          min-height: 44px;
        }
        .filter-btn.active { background: #f3f4f6; }
        .filter-badge {
          background: #E82127;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .sort-select {
          padding: 14px 16px;
          font-size: 14px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          background: #fff;
          cursor: pointer;
          min-width: 140px;
          min-height: 44px;
        }

        /* Main Content */
        .main-content {
          max-width: 1440px;
          margin: 0 auto;
          padding: 16px;
          display: flex;
          gap: 24px;
          position: relative;
        }

        /* Filter Overlay (mobile) */
        .filter-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 150;
        }

        /* Filter Sidebar */
        .filter-sidebar {
          width: 280px;
          flex-shrink: 0;
        }
        .filter-sidebar.mobile {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 100%;
          max-width: 320px;
          z-index: 200;
          background: #fff;
          animation: slideIn 0.3s ease;
        }
        .filter-container {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          position: sticky;
          top: 80px;
          max-height: calc(100vh - 100px);
          overflow-y: auto;
        }
        .filter-sidebar.mobile .filter-container {
          position: static;
          max-height: 100vh;
          border: none;
          border-radius: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .filter-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .filter-title {
          font-size: 15px;
          font-weight: 600;
          color: #111;
        }
        .filter-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .clear-filters-btn {
          font-size: 14px;
          color: #E82127;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 500;
          padding: 8px;
          min-height: 44px;
        }
        .close-filters-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 8px;
          min-width: 44px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .filter-section {
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .filter-section-scroll {
          max-height: 200px;
          overflow-y: auto;
        }
        .filter-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #111;
          margin-bottom: 12px;
        }

        .discount-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 8px 0;
          min-height: 44px;
        }
        .discount-toggle input {
          width: 20px;
          height: 20px;
          accent-color: #16a34a;
          cursor: pointer;
        }
        .discount-label {
          font-size: 14px;
          font-weight: 500;
          color: #111;
        }
        .discount-count {
          font-size: 12px;
          color: #16a34a;
          font-weight: 600;
          margin-left: auto;
        }

        .price-inputs {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }
        .price-input-group {
          flex: 1;
        }
        .price-input-group label {
          font-size: 11px;
          color: #6b7280;
          display: block;
          margin-bottom: 4px;
        }
        .price-input-group input {
          width: 100%;
          padding: 10px 12px;
          font-size: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          min-height: 44px;
        }
        .price-slider {
          width: 100%;
          accent-color: #E82127;
        }
        .price-range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #6b7280;
          margin-top: 4px;
        }

        .filter-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .filter-option {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 6px 0;
          min-height: 44px;
        }
        .filter-option input {
          width: 18px;
          height: 18px;
          accent-color: #E82127;
          cursor: pointer;
          flex-shrink: 0;
        }
        .filter-option span {
          font-size: 14px;
          color: #374151;
          flex: 1;
        }

        .filter-apply-section {
          padding: 16px 20px;
          border-top: 1px solid #e5e7eb;
          margin-top: auto;
        }
        .filter-apply-btn {
          width: 100%;
          padding: 14px;
          background: #E82127;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          min-height: 48px;
        }

        /* Products Main */
        .products-main {
          flex: 1;
          min-width: 0;
        }
        .products-main.with-sidebar {
          /* No special styles needed */
        }

        .results-header {
          margin-bottom: 16px;
        }
        .results-info {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }
        .results-count {
          font-size: 14px;
          color: #6b7280;
        }
        .results-count strong { color: #111; }

        .filter-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 20px;
        }
        .pill button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          min-width: 24px;
          min-height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pill-red { background: #fee2e2; color: #dc2626; }
        .pill-red button { color: #dc2626; }
        .pill-yellow { background: #fef3c7; color: #92400e; }
        .pill-yellow button { color: #92400e; }
        .pill-blue { background: #dbeafe; color: #1d4ed8; }
        .pill-blue button { color: #1d4ed8; }
        .pill-green { background: #dcfce7; color: #16a34a; }
        .pill-green button { color: #16a34a; }

        .error-state {
          padding: 48px 24px;
          text-align: center;
          background: #fef2f2;
          border-radius: 12px;
          border: 1px solid #fecaca;
        }
        .error-state h3 {
          color: #dc2626;
          margin-bottom: 8px;
          font-size: 18px;
          font-weight: 600;
        }
        .error-state p {
          color: #991b1b;
          margin-bottom: 16px;
          font-size: 14px;
        }
        .error-state button {
          padding: 10px 20px;
          background: #E82127;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          transition: opacity 0.2s ease;
        }
        .products-grid.loading { opacity: 0.7; }

        .product-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
        }
        .product-link {
          text-decoration: none;
          color: inherit;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .product-image-wrap {
          position: relative;
          aspect-ratio: 4/3;
          background: #f9fafb;
        }
        .discount-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #16a34a;
          color: #fff;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
        }
        .product-info {
          padding: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .product-meta {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 6px;
          display: flex;
          justify-content: space-between;
        }
        .product-model { color: #9ca3af; }
        .product-title {
          font-size: 14px;
          font-weight: 500;
          color: #111;
          margin-bottom: 8px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 39px;
        }
        .product-price {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-top: auto;
        }
        .price-discounted {
          font-size: 16px;
          font-weight: 700;
          color: #16a34a;
        }
        .price-original {
          font-size: 12px;
          color: #9ca3af;
          text-decoration: line-through;
        }
        .price-regular {
          font-size: 18px;
          font-weight: 700;
          color: #111;
        }
        .price-with-code {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #16a34a;
          margin-top: 2px;
        }
        .discount-code {
          margin-top: 8px;
          padding: 8px 10px;
          background: #f0fdf4;
          border: 1px dashed #86efac;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .discount-code .code {
          font-size: 14px;
          font-weight: 700;
          color: #15803d;
          font-family: monospace;
          letter-spacing: 0.5px;
        }
        .discount-code .discount-percent {
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          background: #16a34a;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .product-action {
          padding: 0 12px 12px;
        }
        .buy-btn {
          display: block;
          width: 100%;
          padding: 12px;
          background: #E82127;
          color: #fff;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          text-align: center;
          min-height: 44px;
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        .page-btn {
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          cursor: pointer;
          min-height: 44px;
          min-width: 44px;
        }
        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .page-current {
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          background: #111;
          color: #fff;
          border-radius: 8px;
          min-height: 44px;
        }

        /* Comparisons Grid */
        .comparisons-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .comparison-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid #e5e7eb;
        }
        .comparison-image {
          position: relative;
          aspect-ratio: 16/10;
          background: #f9fafb;
        }
        .savings-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #16a34a;
          color: #fff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
        }
        .comparison-info {
          padding: 16px;
        }
        .store-count {
          font-size: 11px;
          padding: 4px 8px;
          background: #fef3c7;
          color: #92400e;
          border-radius: 4px;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 10px;
        }
        .comparison-title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 12px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .comparison-prices {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .price-label {
          font-size: 11px;
          color: #6b7280;
          display: block;
        }
        .best-price {
          font-size: 22px;
          font-weight: 700;
          color: #16a34a;
        }
        .savings-info { text-align: right; }
        .savings-amount {
          font-size: 16px;
          font-weight: 700;
          color: #111;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 200;
        }
        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 32px);
          max-width: 600px;
          max-height: 85vh;
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          z-index: 201;
        }
        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .modal-header h2 {
          font-size: 16px;
          font-weight: 700;
          line-height: 1.3;
          margin-bottom: 4px;
        }
        .modal-header p {
          font-size: 13px;
          color: #6b7280;
        }
        .modal-close {
          background: #f3f4f6;
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 20px;
          flex-shrink: 0;
        }
        .modal-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-bottom: 1px solid #e5e7eb;
        }
        .modal-stat {
          padding: 16px;
          text-align: center;
          border-right: 1px solid #e5e7eb;
        }
        .modal-stat:last-child { border-right: none; }
        .modal-stat span {
          font-size: 11px;
          color: #6b7280;
          display: block;
          margin-bottom: 4px;
        }
        .modal-stat strong {
          font-size: 20px;
          font-weight: 700;
        }
        .modal-stat .green { color: #16a34a; }
        .modal-stat .red { color: #E82127; }
        .modal-body {
          padding: 16px;
          max-height: calc(85vh - 180px);
          overflow-y: auto;
        }
        .store-row {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 10px;
          margin-bottom: 10px;
          border: 1px solid #e5e7eb;
          align-items: center;
          flex-wrap: wrap;
        }
        .store-row.best {
          background: #f0fdf4;
          border: 2px solid #86efac;
        }
        .store-image {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          background: #fff;
          border: 1px solid #e5e7eb;
          position: relative;
        }
        .store-info {
          flex: 1;
          min-width: 0;
        }
        .store-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .store-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
        }
        .best-badge {
          font-size: 10px;
          padding: 3px 8px;
          background: #16a34a;
          color: #fff;
          border-radius: 4px;
          font-weight: 700;
        }
        .store-price {
          font-size: 16px;
          font-weight: 700;
        }
        .store-price.green { color: #16a34a; }
        .store-discount {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #16a34a;
          flex-wrap: wrap;
        }
        .store-discount .code {
          font-family: monospace;
          background: #dcfce7;
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: 700;
          color: #15803d;
        }
        .store-btn {
          padding: 12px 18px;
          background: #E82127;
          color: #fff;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          min-height: 44px;
        }
        .store-btn.green { background: #16a34a; }

        /* Desktop visibility */
        .desktop-only { display: flex; }

        /* Responsive */
        @media (min-width: 640px) {
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .comparisons-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          .comparisons-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .product-info {
            padding: 14px;
          }
          .product-title {
            font-size: 14px;
          }
          .price-discounted, .price-regular {
            font-size: 18px;
          }
          .buy-btn {
            font-size: 13px;
          }
          .filter-btn-text {
            display: inline;
          }
        }

        @media (min-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          .comparisons-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .search-inner {
            padding: 0 24px;
          }
          .main-content {
            padding: 24px;
          }
        }

        @media (min-width: 1280px) {
          .products-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        @media (max-width: 767px) {
          .filter-overlay {
            display: block;
          }
          .desktop-only {
            display: none !important;
          }
          .filter-btn-text {
            display: none;
          }
          .sort-select {
            min-width: 110px;
            padding: 14px 10px;
            font-size: 14px;
          }
          .modal-header h2 {
            font-size: 15px;
          }
          .modal-stat strong {
            font-size: 18px;
          }
          .store-btn {
            width: 100%;
            text-align: center;
            margin-top: 8px;
          }
        }

        /* Small phones (iPhone SE, 375px and below) */
        @media (max-width: 375px) {
          .view-toggle {
            padding: 3px;
          }
          .toggle-btn {
            padding: 7px 10px;
            font-size: 11px;
          }
          .search-bar {
            padding: 10px 0;
          }
          .search-inner {
            padding: 0 12px;
          }
          .search-row {
            gap: 6px;
          }
          .search-input {
            font-size: 16px;
            padding: 13px 14px 13px 42px;
            -webkit-text-size-adjust: 100%;
          }
          .price-input-group input {
            font-size: 16px;
            -webkit-text-size-adjust: 100%;
          }
          .filter-btn {
            padding: 13px 12px;
          }
          .sort-select {
            min-width: 95px;
            padding: 13px 8px;
            font-size: 13px;
          }
          .main-content {
            padding: 12px;
          }
          .products-grid {
            gap: 12px;
          }
          .comparisons-grid {
            gap: 12px;
          }
          .product-info {
            padding: 10px;
          }
          .product-title {
            font-size: 13px;
            min-height: 36px;
          }
          .product-meta {
            font-size: 10px;
          }
          .price-discounted, .price-regular {
            font-size: 15px;
          }
          .price-original {
            font-size: 11px;
          }
          .buy-btn {
            padding: 11px;
            font-size: 13px;
          }
          .product-action {
            padding: 0 10px 10px;
          }
          .pagination {
            gap: 6px;
          }
          .page-btn {
            padding: 11px 14px;
            font-size: 13px;
          }
          .page-current {
            padding: 11px 16px;
            font-size: 13px;
          }
        }

        /* Landscape phones (improve usability) */
        @media (max-width: 767px) and (orientation: landscape) {
          .view-toggle {
            padding: 3px;
          }
          .toggle-btn {
            padding: 8px 12px;
            font-size: 12px;
            min-height: 36px;
          }
          .search-bar {
            padding: 8px 0;
          }
          .search-input {
            padding: 10px 14px 10px 42px;
            min-height: 40px;
          }
          .filter-btn, .sort-select {
            padding: 10px 14px;
            min-height: 40px;
          }
          .filter-sidebar.mobile {
            max-width: 280px;
          }
        }

        @keyframes spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
