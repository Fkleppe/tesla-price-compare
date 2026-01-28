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

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setShowFilters(false);
      else setShowFilters(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, showFilters]);

  const fallbackData: PaginatedResponse<Product> = useMemo(() => ({
    products: initialProducts,
    meta: initialMeta,
  }), [initialProducts, initialMeta]);

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

  const discountedCount = useMemo(() => {
    return initialProducts.filter(p => getDiscountInfo(p.url) !== null).length;
  }, [initialProducts]);

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
    setSelectedModels(prev => prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]);
    setPage(1);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    setPage(1);
  };

  const toggleSource = (source: string) => {
    setSelectedSources(prev => prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]);
    setPage(1);
  };

  const activeFiltersCount = selectedModels.length + selectedCategories.length + selectedSources.length + (onlyDiscounted ? 1 : 0) + (priceMin > 0 || priceMax < 5000 ? 1 : 0);
  const showLoadingState = isLoading || (isValidating && products.length === 0);

  return (
    <div className="app">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-inner">
          {/* View Toggle */}
          <div className="view-toggle">
            <button
              onClick={() => { setViewMode('products'); setPage(1); }}
              className={`toggle-btn ${viewMode === 'products' ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>Products</span>
              <span className="toggle-count">{totalProducts.toLocaleString()}</span>
            </button>
            <button
              onClick={() => setViewMode('comparisons')}
              className={`toggle-btn ${viewMode === 'comparisons' ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h5v5M8 3H3v5M3 16v5h5M21 16v5h-5M12 8v8M8 12h8" />
              </svg>
              <span>Compare</span>
              <span className="toggle-count">{filteredMatches.length}</span>
            </button>
          </div>

          {/* Search */}
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              className="search-input"
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => { setSearchQuery(''); setPage(1); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
            {isValidating && <div className="search-loading" />}
          </div>

          {/* Filter & Sort */}
          <div className="toolbar-actions">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`action-btn ${showFilters ? 'active' : ''} ${activeFiltersCount > 0 ? 'has-filters' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              <span className="action-label">Filters</span>
              {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
            </button>

            <div className="sort-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M6 12h12M9 18h6" />
              </svg>
              <select
                value={sortBy}
                onChange={e => { setSortBy(e.target.value as SortOption); setPage(1); }}
                className="sort-select"
              >
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="discount-desc">Biggest Discount</option>
                <option value="name-asc">Name: A → Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="layout">
        {/* Filter Overlay (Mobile) */}
        {isMobile && showFilters && (
          <div className="filter-overlay" onClick={() => setShowFilters(false)} />
        )}

        {/* Sidebar */}
        {showFilters && (
          <aside className={`sidebar ${isMobile ? 'mobile' : ''}`}>
            <div className="sidebar-header">
              <h3>Filters</h3>
              <div className="sidebar-actions">
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="clear-btn">Clear all</button>
                )}
                {isMobile && (
                  <button onClick={() => setShowFilters(false)} className="close-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="sidebar-content">
              {/* Sale Toggle */}
              <div className="filter-group">
                <label className="sale-toggle">
                  <input
                    type="checkbox"
                    checked={onlyDiscounted}
                    onChange={e => { setOnlyDiscounted(e.target.checked); setPage(1); }}
                  />
                  <div className="toggle-track">
                    <div className="toggle-thumb" />
                  </div>
                  <div className="toggle-info">
                    <span className="toggle-label">On Sale Only</span>
                    <span className="toggle-count">{discountedCount} items</span>
                  </div>
                </label>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h4>Price Range</h4>
                <div className="price-range">
                  <div className="price-inputs">
                    <div className="price-field">
                      <span className="price-symbol">$</span>
                      <input
                        type="number"
                        value={priceMin}
                        onChange={e => { setPriceMin(Number(e.target.value)); setPage(1); }}
                        min={0}
                        placeholder="Min"
                      />
                    </div>
                    <span className="price-separator">—</span>
                    <div className="price-field">
                      <span className="price-symbol">$</span>
                      <input
                        type="number"
                        value={priceMax}
                        onChange={e => { setPriceMax(Number(e.target.value)); setPage(1); }}
                        min={0}
                        placeholder="Max"
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
                </div>
              </div>

              {/* Models */}
              <div className="filter-group">
                <h4>Tesla Model</h4>
                <div className="filter-chips">
                  {stats.models.map(model => (
                    <button
                      key={model}
                      onClick={() => toggleModel(model)}
                      className={`chip ${selectedModels.includes(model) ? 'active' : ''}`}
                    >
                      {MODEL_LABELS[model] || model}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="filter-group filter-group-scroll">
                <h4>Category</h4>
                <div className="filter-list">
                  {stats.categories.map(cat => (
                    <label key={cat} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                      <span className="checkbox-mark" />
                      <span className="checkbox-label">{formatCategory(cat)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stores */}
              <div className="filter-group">
                <h4>Store</h4>
                <div className="filter-chips">
                  {stats.sources.map(source => (
                    <button
                      key={source}
                      onClick={() => toggleSource(source)}
                      className={`chip ${selectedSources.includes(source) ? 'active' : ''}`}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {isMobile && (
              <div className="sidebar-footer">
                <button onClick={() => setShowFilters(false)} className="apply-btn">
                  Show {totalProducts.toLocaleString()} Results
                </button>
              </div>
            )}
          </aside>
        )}

        {/* Main Content */}
        <main className={`main ${showFilters && !isMobile ? 'with-sidebar' : ''}`}>
          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="active-filters">
              {selectedModels.map(m => (
                <button key={m} onClick={() => toggleModel(m)} className="filter-tag filter-tag-red">
                  {MODEL_LABELS[m] || m}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              ))}
              {selectedCategories.map(c => (
                <button key={c} onClick={() => toggleCategory(c)} className="filter-tag filter-tag-blue">
                  {formatCategory(c)}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              ))}
              {selectedSources.map(s => (
                <button key={s} onClick={() => toggleSource(s)} className="filter-tag filter-tag-purple">
                  {s}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              ))}
              {onlyDiscounted && (
                <button onClick={() => setOnlyDiscounted(false)} className="filter-tag filter-tag-green">
                  On Sale
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Products View */}
          {viewMode === 'products' && (
            <>
              {error ? (
                <div className="error-state">
                  <div className="error-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                  </div>
                  <h3>Failed to load products</h3>
                  <p>Please check your connection and try again.</p>
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
                      <article key={`${p.url}-${idx}`} className="product-card" style={{ animationDelay: `${Math.min(idx, 11) * 30}ms` }}>
                        <Link href={`/product/${generateSlug(p.title)}`} className="product-link">
                          <div className="product-image">
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
                              <div className="sale-badge">
                                <span>-{discount.percent}%</span>
                              </div>
                            )}
                            <div className="product-overlay">
                              <span>View Details</span>
                            </div>
                          </div>
                          <div className="product-body">
                            <div className="product-meta">
                              <span className="product-store">{p.source}</span>
                              {p.models?.filter(m => m !== 'universal').slice(0, 1).map(m => (
                                <span key={m} className="product-model">{MODEL_LABELS[m]?.replace('Model ', '') || m}</span>
                              ))}
                            </div>
                            <h3 className="product-title">{p.title}</h3>
                            <div className="product-pricing">
                              <span className="product-price">${p.price.toFixed(0)}</span>
                              {discount && (
                                <span className="product-savings">
                                  ${(p.price * (1 - discount.percent / 100)).toFixed(0)} with code
                                </span>
                              )}
                            </div>
                            {discount && (
                              <div className="discount-box">
                                <span className="discount-code">{discount.code}</span>
                                <span className="discount-label">-{discount.percent}%</span>
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="product-footer">
                          <a href={affiliateUrl} target="_blank" rel="noopener noreferrer" className="buy-btn">
                            <span>Shop at {p.source}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button onClick={() => setPage(1)} disabled={page === 1} className="page-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                    </svg>
                  </button>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="page-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <div className="page-info">
                    <span className="page-current">{page}</span>
                    <span className="page-separator">/</span>
                    <span className="page-total">{totalPages}</span>
                  </div>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="page-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                  <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="page-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}

          {/* Comparisons View */}
          {viewMode === 'comparisons' && (
            <div className="comparisons-grid">
              {filteredMatches.map((match, idx) => (
                <article
                  key={match.matchKey}
                  onClick={() => setSelectedMatch(match)}
                  className="comparison-card"
                  style={{ animationDelay: `${Math.min(idx, 11) * 30}ms` }}
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
                      <div className="comparison-badge">Save {match.savingsPercent}%</div>
                    </div>
                  )}
                  <div className="comparison-body">
                    <div className="comparison-meta">
                      <span className="store-count">{match.products.length} stores</span>
                    </div>
                    <h3 className="comparison-title">{match.products[0]?.title}</h3>
                    <div className="comparison-footer">
                      <div className="price-block">
                        <span className="price-label">Best price</span>
                        <span className="price-value">${match.lowestPrice.toFixed(0)}</span>
                      </div>
                      <div className="savings-block">
                        <span className="savings-label">You save</span>
                        <span className="savings-value">${match.savings.toFixed(0)}</span>
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
        <div className="modal-wrap">
          <div className="modal-backdrop" onClick={() => setSelectedMatch(null)} />
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h2>{selectedMatch.products[0]?.title}</h2>
                <p>{selectedMatch.products.length} stores • {selectedMatch.category}</p>
              </div>
              <button onClick={() => setSelectedMatch(null)} className="modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-stats">
              <div className="modal-stat">
                <span className="modal-stat-label">Best Price</span>
                <span className="modal-stat-value best">${selectedMatch.lowestPrice.toFixed(0)}</span>
              </div>
              <div className="modal-stat">
                <span className="modal-stat-label">Highest</span>
                <span className="modal-stat-value">${selectedMatch.highestPrice.toFixed(0)}</span>
              </div>
              <div className="modal-stat">
                <span className="modal-stat-label">You Save</span>
                <span className="modal-stat-value save">${selectedMatch.savings.toFixed(0)}</span>
              </div>
            </div>

            <div className="modal-body">
              {selectedMatch.products.sort((a, b) => a.price - b.price).map((p, i) => {
                const discountInfo = getDiscountInfo(p.url);
                const affiliateUrl = getAffiliateUrl(p.url);

                return (
                  <div key={i} className={`store-row ${i === 0 ? 'best' : ''}`}>
                    {p.image && (
                      <div className="store-thumb">
                        <Image src={p.image} alt={p.title} fill sizes="64px" style={{ objectFit: 'cover' }} />
                      </div>
                    )}
                    <div className="store-details">
                      <div className="store-header">
                        <div className="store-name">
                          <span>{p.source}</span>
                          {i === 0 && <span className="best-label">BEST</span>}
                        </div>
                        <span className={`store-price ${i === 0 ? 'best' : ''}`}>${p.price.toFixed(2)}</span>
                      </div>
                      {discountInfo && (
                        <div className="store-promo">
                          <span>Extra {discountInfo.percent}% off:</span>
                          <code>{discountInfo.code}</code>
                        </div>
                      )}
                    </div>
                    <a href={affiliateUrl} target="_blank" rel="noopener noreferrer" className={`store-btn ${i === 0 ? 'primary' : ''}`}>
                      Shop
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* ===== LAYOUT ===== */
        .app {
          min-height: 100vh;
          background: #FAFAFA;
        }

        /* ===== TOOLBAR ===== */
        .toolbar {
          background: #FFFFFF;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .toolbar-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* View Toggle */
        .view-toggle {
          display: flex;
          background: #F4F4F5;
          border-radius: 12px;
          padding: 4px;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          font-family: 'Satoshi', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #71717A;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-btn svg {
          width: 16px;
          height: 16px;
        }

        .toggle-btn.active {
          background: #FFFFFF;
          color: #09090B;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .toggle-count {
          font-size: 11px;
          padding: 2px 6px;
          background: rgba(0, 0, 0, 0.06);
          border-radius: 6px;
        }

        .toggle-btn.active .toggle-count {
          background: #E82127;
          color: #FFFFFF;
        }

        /* Search */
        .search-wrap {
          flex: 1;
          min-width: 200px;
          max-width: 480px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: #A1A1AA;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 12px 44px;
          font-size: 15px;
          color: #09090B;
          background: #F4F4F5;
          border: 2px solid transparent;
          border-radius: 12px;
          outline: none;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          background: #FFFFFF;
          border-color: #E82127;
          box-shadow: 0 0 0 4px rgba(232, 33, 39, 0.08);
        }

        .search-input::placeholder {
          color: #A1A1AA;
        }

        .search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #E4E4E7;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .search-clear:hover {
          background: #D4D4D8;
        }

        .search-clear svg {
          width: 12px;
          height: 12px;
          color: #71717A;
        }

        .search-loading {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          border: 2px solid #E4E4E7;
          border-top-color: #E82127;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: translateY(-50%) rotate(360deg); }
        }

        /* Actions */
        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          font-family: 'Satoshi', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #52525B;
          background: #FFFFFF;
          border: 1.5px solid #E4E4E7;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          border-color: #D4D4D8;
          background: #FAFAFA;
        }

        .action-btn.active {
          background: #09090B;
          border-color: #09090B;
          color: #FFFFFF;
        }

        .action-btn svg {
          width: 16px;
          height: 16px;
        }

        .filter-badge {
          padding: 2px 6px;
          font-size: 10px;
          font-weight: 700;
          background: #E82127;
          color: #FFFFFF;
          border-radius: 6px;
        }

        .sort-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .sort-wrap svg {
          position: absolute;
          left: 12px;
          width: 16px;
          height: 16px;
          color: #71717A;
          pointer-events: none;
        }

        .sort-select {
          padding: 12px 16px 12px 36px;
          font-family: 'Satoshi', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #52525B;
          background: #FFFFFF;
          border: 1.5px solid #E4E4E7;
          border-radius: 10px;
          cursor: pointer;
          outline: none;
          appearance: none;
          min-width: 160px;
          transition: all 0.2s ease;
        }

        .sort-select:hover {
          border-color: #D4D4D8;
        }

        .sort-select:focus {
          border-color: #09090B;
        }

        /* ===== LAYOUT ===== */
        .layout {
          max-width: 1440px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          gap: 24px;
          position: relative;
        }

        .filter-overlay {
          position: fixed;
          inset: 0;
          background: rgba(9, 9, 11, 0.5);
          backdrop-filter: blur(4px);
          z-index: 100;
          animation: fadeIn 0.2s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ===== SIDEBAR ===== */
        .sidebar {
          width: 280px;
          flex-shrink: 0;
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: fit-content;
        }

        .sidebar.mobile {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 100%;
          max-width: 340px;
          border-radius: 0;
          z-index: 200;
          max-height: 100vh;
          animation: slideIn 0.3s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }

        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-header h3 {
          font-family: 'Satoshi', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #09090B;
        }

        .sidebar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .clear-btn {
          font-size: 13px;
          font-weight: 600;
          color: #E82127;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 8px;
          transition: background 0.15s ease;
        }

        .clear-btn:hover {
          background: rgba(232, 33, 39, 0.06);
        }

        .close-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F4F4F5;
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }

        .close-btn svg {
          width: 18px;
          height: 18px;
          color: #71717A;
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .filter-group {
          padding: 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }

        .filter-group:last-child {
          border-bottom: none;
        }

        .filter-group h4 {
          font-family: 'Satoshi', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #71717A;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .filter-group-scroll {
          max-height: 200px;
          overflow-y: auto;
        }

        /* Sale Toggle */
        .sale-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .sale-toggle input {
          display: none;
        }

        .toggle-track {
          width: 44px;
          height: 26px;
          background: #E4E4E7;
          border-radius: 13px;
          position: relative;
          transition: background 0.2s ease;
        }

        .sale-toggle input:checked + .toggle-track {
          background: #22C55E;
        }

        .toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          background: #FFFFFF;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s ease;
        }

        .sale-toggle input:checked + .toggle-track .toggle-thumb {
          transform: translateX(18px);
        }

        .toggle-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .toggle-label {
          font-size: 14px;
          font-weight: 600;
          color: #09090B;
        }

        .toggle-count {
          font-size: 12px;
          color: #71717A;
        }

        /* Price Range */
        .price-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .price-field {
          flex: 1;
          position: relative;
        }

        .price-symbol {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 13px;
          color: #71717A;
        }

        .price-field input {
          width: 100%;
          padding: 10px 12px 10px 28px;
          font-size: 14px;
          color: #09090B;
          background: #F4F4F5;
          border: 1.5px solid transparent;
          border-radius: 8px;
          outline: none;
          transition: all 0.2s ease;
        }

        .price-field input:focus {
          background: #FFFFFF;
          border-color: #09090B;
        }

        .price-separator {
          color: #D4D4D8;
        }

        .price-slider {
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          background: #E4E4E7;
          border-radius: 2px;
          outline: none;
        }

        .price-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: #E82127;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(232, 33, 39, 0.3);
          transition: transform 0.15s ease;
        }

        .price-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        /* Filter Chips */
        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .chip {
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 500;
          color: #52525B;
          background: #F4F4F5;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .chip:hover {
          background: #E4E4E7;
        }

        .chip.active {
          background: #09090B;
          color: #FFFFFF;
        }

        /* Filter Checkboxes */
        .filter-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .filter-checkbox:hover {
          background: #F4F4F5;
        }

        .filter-checkbox input {
          display: none;
        }

        .checkbox-mark {
          width: 18px;
          height: 18px;
          background: #F4F4F5;
          border: 2px solid #D4D4D8;
          border-radius: 5px;
          position: relative;
          transition: all 0.15s ease;
        }

        .filter-checkbox input:checked + .checkbox-mark {
          background: #E82127;
          border-color: #E82127;
        }

        .filter-checkbox input:checked + .checkbox-mark::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 5px;
          width: 4px;
          height: 8px;
          border: 2px solid #FFFFFF;
          border-top: none;
          border-left: none;
          transform: rotate(45deg);
        }

        .checkbox-label {
          font-size: 14px;
          color: #52525B;
        }

        .sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .apply-btn {
          width: 100%;
          padding: 14px;
          font-family: 'Satoshi', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #FFFFFF;
          background: #E82127;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .apply-btn:hover {
          background: #CC1C21;
        }

        /* ===== MAIN ===== */
        .main {
          flex: 1;
          min-width: 0;
        }

        .main.with-sidebar {
          /* has sidebar */
        }

        /* Active Filters */
        .active-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .filter-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .filter-tag svg {
          width: 12px;
          height: 12px;
          opacity: 0.7;
        }

        .filter-tag:hover svg {
          opacity: 1;
        }

        .filter-tag-red {
          background: rgba(232, 33, 39, 0.1);
          color: #E82127;
        }

        .filter-tag-blue {
          background: rgba(59, 130, 246, 0.1);
          color: #3B82F6;
        }

        .filter-tag-purple {
          background: rgba(139, 92, 246, 0.1);
          color: #8B5CF6;
        }

        .filter-tag-green {
          background: rgba(34, 197, 94, 0.1);
          color: #22C55E;
        }

        /* ===== PRODUCTS GRID ===== */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          transition: opacity 0.2s ease;
        }

        .products-grid.loading {
          opacity: 0.6;
        }

        @media (min-width: 640px) {
          .products-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (min-width: 1024px) {
          .products-grid { grid-template-columns: repeat(4, 1fr); }
        }

        @media (min-width: 1280px) {
          .products-grid { grid-template-columns: repeat(5, 1fr); }
        }

        /* Product Card */
        .product-card {
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
          opacity: 0;
          animation: cardIn 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .product-card:hover {
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
        }

        .product-link {
          text-decoration: none;
          color: inherit;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-image {
          position: relative;
          aspect-ratio: 1;
          background: #F4F4F5;
          overflow: hidden;
        }

        .product-overlay {
          position: absolute;
          inset: 0;
          background: rgba(9, 9, 11, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .product-card:hover .product-overlay {
          opacity: 1;
        }

        .product-overlay span {
          padding: 10px 20px;
          background: #FFFFFF;
          font-family: 'Satoshi', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #09090B;
          border-radius: 8px;
          transform: translateY(8px);
          transition: transform 0.2s ease;
        }

        .product-card:hover .product-overlay span {
          transform: translateY(0);
        }

        .sale-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 10px;
          background: #22C55E;
          font-family: 'Satoshi', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #FFFFFF;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }

        .product-body {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .product-store {
          font-size: 11px;
          font-weight: 600;
          color: #71717A;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .product-model {
          font-size: 11px;
          font-weight: 500;
          color: #A1A1AA;
        }

        .product-title {
          font-family: 'Satoshi', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #09090B;
          line-height: 1.4;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 39px;
        }

        .product-pricing {
          margin-top: auto;
        }

        .product-price {
          font-family: 'Satoshi', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #09090B;
        }

        .product-savings {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #22C55E;
          margin-top: 2px;
        }

        .discount-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
          padding: 10px 12px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.04) 100%);
          border: 1px dashed rgba(34, 197, 94, 0.3);
          border-radius: 10px;
        }

        .discount-code {
          font-family: 'SF Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          color: #16A34A;
          letter-spacing: 0.5px;
        }

        .discount-label {
          font-size: 11px;
          font-weight: 700;
          color: #FFFFFF;
          background: #22C55E;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .product-footer {
          padding: 0 16px 16px;
        }

        .buy-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          font-family: 'Satoshi', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #FFFFFF;
          background: #09090B;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .buy-btn:hover {
          background: #27272A;
          transform: translateY(-1px);
        }

        .buy-btn svg {
          width: 16px;
          height: 16px;
          transition: transform 0.2s ease;
        }

        .buy-btn:hover svg {
          transform: translateX(4px);
        }

        /* ===== PAGINATION ===== */
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 32px;
        }

        .page-btn {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;
          border: 1.5px solid #E4E4E7;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .page-btn:hover:not(:disabled) {
          border-color: #09090B;
          background: #F4F4F5;
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .page-btn svg {
          width: 16px;
          height: 16px;
          color: #52525B;
        }

        .page-info {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 16px;
          font-family: 'Satoshi', sans-serif;
        }

        .page-current {
          font-size: 16px;
          font-weight: 700;
          color: #09090B;
        }

        .page-separator {
          color: #D4D4D8;
        }

        .page-total {
          font-size: 14px;
          font-weight: 500;
          color: #71717A;
        }

        /* ===== ERROR STATE ===== */
        .error-state {
          text-align: center;
          padding: 64px 24px;
          background: #FFFFFF;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 16px;
        }

        .error-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 50%;
        }

        .error-icon svg {
          width: 32px;
          height: 32px;
          color: #EF4444;
        }

        .error-state h3 {
          font-family: 'Satoshi', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #09090B;
          margin-bottom: 8px;
        }

        .error-state p {
          font-size: 14px;
          color: #71717A;
          margin-bottom: 24px;
        }

        .error-state button {
          padding: 12px 24px;
          font-family: 'Satoshi', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #FFFFFF;
          background: #E82127;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .error-state button:hover {
          background: #CC1C21;
        }

        /* ===== COMPARISONS GRID ===== */
        .comparisons-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (min-width: 768px) {
          .comparisons-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 1024px) {
          .comparisons-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .comparison-card {
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
          opacity: 0;
          animation: cardIn 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }

        .comparison-card:hover {
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
        }

        .comparison-image {
          position: relative;
          aspect-ratio: 16/10;
          background: #F4F4F5;
        }

        .comparison-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 8px 12px;
          background: #22C55E;
          font-family: 'Satoshi', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #FFFFFF;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }

        .comparison-body {
          padding: 20px;
        }

        .comparison-meta {
          margin-bottom: 12px;
        }

        .store-count {
          display: inline-block;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 700;
          color: #92400E;
          background: #FEF3C7;
          border-radius: 6px;
        }

        .comparison-title {
          font-family: 'Satoshi', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #09090B;
          line-height: 1.4;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .comparison-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .price-block, .savings-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .price-label, .savings-label {
          font-size: 11px;
          font-weight: 500;
          color: #71717A;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .price-value {
          font-family: 'Satoshi', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #22C55E;
        }

        .savings-block {
          text-align: right;
        }

        .savings-value {
          font-family: 'Satoshi', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #09090B;
        }

        /* ===== MODAL ===== */
        .modal-wrap {
          position: fixed;
          inset: 0;
          z-index: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(9, 9, 11, 0.6);
          backdrop-filter: blur(8px);
          animation: fadeIn 0.2s ease forwards;
        }

        .modal {
          position: relative;
          width: 100%;
          max-width: 560px;
          max-height: 85vh;
          background: #FFFFFF;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: modalIn 0.3s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          gap: 16px;
        }

        .modal-title-wrap {
          flex: 1;
          min-width: 0;
        }

        .modal-header h2 {
          font-family: 'Satoshi', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #09090B;
          line-height: 1.3;
          margin-bottom: 4px;
        }

        .modal-header p {
          font-size: 13px;
          color: #71717A;
        }

        .modal-close {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F4F4F5;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .modal-close:hover {
          background: #E4E4E7;
        }

        .modal-close svg {
          width: 18px;
          height: 18px;
          color: #71717A;
        }

        .modal-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .modal-stat {
          padding: 20px;
          text-align: center;
          border-right: 1px solid rgba(0, 0, 0, 0.06);
        }

        .modal-stat:last-child {
          border-right: none;
        }

        .modal-stat-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #71717A;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 6px;
        }

        .modal-stat-value {
          font-family: 'Satoshi', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #09090B;
        }

        .modal-stat-value.best {
          color: #22C55E;
        }

        .modal-stat-value.save {
          color: #E82127;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .store-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #F4F4F5;
          border-radius: 14px;
          margin-bottom: 10px;
        }

        .store-row.best {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.04) 100%);
          border: 2px solid rgba(34, 197, 94, 0.3);
        }

        .store-thumb {
          width: 56px;
          height: 56px;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          background: #FFFFFF;
          flex-shrink: 0;
        }

        .store-details {
          flex: 1;
          min-width: 0;
        }

        .store-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .store-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Satoshi', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #09090B;
        }

        .best-label {
          font-size: 10px;
          font-weight: 700;
          color: #FFFFFF;
          background: #22C55E;
          padding: 3px 8px;
          border-radius: 5px;
        }

        .store-price {
          font-family: 'Satoshi', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #09090B;
        }

        .store-price.best {
          color: #22C55E;
        }

        .store-promo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #22C55E;
        }

        .store-promo code {
          font-family: 'SF Mono', monospace;
          font-weight: 700;
          background: rgba(34, 197, 94, 0.15);
          padding: 2px 8px;
          border-radius: 5px;
        }

        .store-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px 16px;
          font-family: 'Satoshi', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #52525B;
          background: #FFFFFF;
          border: 1.5px solid #E4E4E7;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .store-btn:hover {
          border-color: #09090B;
          color: #09090B;
        }

        .store-btn.primary {
          background: #22C55E;
          border-color: #22C55E;
          color: #FFFFFF;
        }

        .store-btn.primary:hover {
          background: #16A34A;
          border-color: #16A34A;
        }

        .store-btn svg {
          width: 14px;
          height: 14px;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 767px) {
          .toolbar-inner {
            padding: 12px 16px;
          }

          .view-toggle {
            order: 3;
            width: 100%;
          }

          .toggle-btn span:not(.toggle-count) {
            display: none;
          }

          .search-wrap {
            order: 1;
            flex: 1;
            max-width: none;
          }

          .toolbar-actions {
            order: 2;
          }

          .action-label {
            display: none;
          }

          .layout {
            padding: 16px;
          }

          .modal {
            max-height: 90vh;
            border-radius: 16px 16px 0 0;
            margin-top: auto;
          }

          .store-row {
            flex-wrap: wrap;
          }

          .store-btn {
            width: 100%;
            justify-content: center;
            margin-top: 8px;
          }
        }

        @media (max-width: 375px) {
          .products-grid {
            gap: 12px;
          }

          .product-body {
            padding: 12px;
          }

          .product-title {
            font-size: 13px;
            min-height: 36px;
          }

          .product-price {
            font-size: 18px;
          }

          .buy-btn {
            padding: 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
