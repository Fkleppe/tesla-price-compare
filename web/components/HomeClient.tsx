'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { getAffiliateUrl, getDiscountInfo, isAffiliatePartner } from '../lib/affiliate';
import { Product, ProductMatch } from '../lib/types';
import Header from './Header';
import Footer from './Footer';

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

const TOP_10_CATEGORIES = [
  { id: 'mattress', title: 'Tesla Mattresses' },
  { id: 'tent', title: 'Camping Tents' },
  { id: 'floor-mats', title: 'Floor Mats' },
  { id: 'screen-protector', title: 'Screen Protectors' },
  { id: 'center-console', title: 'Center Console' },
  { id: 'charger', title: 'Charging Accessories' },
  { id: 'sunshade', title: 'Sunshades' },
  { id: 'wheel-covers', title: 'Wheel Covers' },
  { id: 'trunk-organizer', title: 'Trunk Organizers' },
  { id: 'phone-mount', title: 'Phone Mounts' },
];

const ITEMS_PER_PAGE = 48;

export default function HomeClient({ initialProducts, initialMatches, stats }: HomeClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('products');
  const [selectedMatch, setSelectedMatch] = useState<ProductMatch | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showTop10Menu, setShowTop10Menu] = useState(false);

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

  // Calculate discounted count
  const discountedCount = useMemo(() => {
    return initialProducts.filter(p => getDiscountInfo(p.url) !== null).length;
  }, [initialProducts]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let filtered = initialProducts;

    if (selectedModels.length > 0) {
      filtered = filtered.filter(p => p.models?.some(m => selectedModels.includes(m)));
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }
    if (selectedSources.length > 0) {
      filtered = filtered.filter(p => selectedSources.includes(p.source));
    }
    filtered = filtered.filter(p => p.price >= priceMin && p.price <= priceMax);
    if (onlyDiscounted) {
      filtered = filtered.filter(p => getDiscountInfo(p.url) !== null);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.title?.toLowerCase().includes(q));
    }

    // Sort
    switch (sortBy) {
      case 'price-asc': filtered = [...filtered].sort((a, b) => a.price - b.price); break;
      case 'price-desc': filtered = [...filtered].sort((a, b) => b.price - a.price); break;
      case 'name-asc': filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'discount-desc':
        filtered = [...filtered].sort((a, b) => {
          const dA = getDiscountInfo(a.url)?.percent || 0;
          const dB = getDiscountInfo(b.url)?.percent || 0;
          return dB - dA;
        });
        break;
    }

    return filtered;
  }, [initialProducts, selectedModels, selectedCategories, selectedSources, priceMin, priceMax, onlyDiscounted, searchQuery, sortBy]);

  // Filtered matches
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

  // Pagination
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, page]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

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

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <header style={{ background: '#0a0a0a', padding: '14px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 20, fontWeight: 700 }}>
              EV<span style={{ color: '#E82127' }}>PriceHunt</span>
            </Link>
            {/* Top 10 Dropdown */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setShowTop10Menu(true)}
              onMouseLeave={() => setShowTop10Menu(false)}
            >
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  color: '#fbbf24',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '8px 0'
                }}
              >
                Top 10 Lists
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {showTop10Menu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  minWidth: 260,
                  padding: '8px 0',
                  zIndex: 200
                }}>
                  <Link
                    href="/top-10"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 16px',
                      color: '#111',
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: 600,
                      borderBottom: '1px solid #e5e7eb'
                    }}
                  >
                    All Top 10 Lists
                  </Link>
                  {TOP_10_CATEGORIES.map(cat => (
                    <Link
                      key={cat.id}
                      href={`/top-10/${cat.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: 500
                      }}
                    >
                      {cat.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 4, background: '#1f1f1f', borderRadius: 8, padding: 4 }}>
              <button
                onClick={() => { setViewMode('products'); setPage(1); }}
                style={{
                  padding: '8px 16px', fontSize: 13, fontWeight: 500, borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: viewMode === 'products' ? '#E82127' : 'transparent',
                  color: '#fff'
                }}
              >
                Products
              </button>
              <button
                onClick={() => setViewMode('comparisons')}
                style={{
                  padding: '8px 16px', fontSize: 13, fontWeight: 500, borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: viewMode === 'comparisons' ? '#E82127' : 'transparent',
                  color: '#fff'
                }}
              >
                Compare Prices
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#a3a3a3' }}>
            {viewMode === 'products' ? (
              <span><strong style={{ color: '#fff' }}>{filteredProducts.length.toLocaleString()}</strong> Products</span>
            ) : (
              <span><strong style={{ color: '#fff' }}>{filteredMatches.length.toLocaleString()}</strong> Price Comparisons</span>
            )}
            <span><strong style={{ color: '#fff' }}>{stats.totalStores}</strong> Stores</span>
            <span><strong style={{ color: '#16a34a' }}>{discountedCount}</strong> On Sale</span>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 0' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 500 }}>
              <input
                type="text"
                placeholder="Search Tesla accessories..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  fontSize: 15,
                  border: '2px solid #e5e7eb',
                  borderRadius: 10,
                  background: '#fff',
                  outline: 'none'
                }}
              />
              <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 500,
                border: '2px solid #e5e7eb',
                borderRadius: 10,
                background: showFilters ? '#f3f4f6' : '#fff',
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFiltersCount > 0 && (
                <span style={{
                  background: '#E82127',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 10
                }}>
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              style={{
                padding: '12px 16px',
                fontSize: 14,
                border: '2px solid #e5e7eb',
                borderRadius: 10,
                background: '#fff',
                cursor: 'pointer'
              }}
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
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '24px', display: 'flex', gap: 24 }}>
        {/* Sidebar Filters */}
        {showFilters && (
          <aside style={{ width: 280, flexShrink: 0 }}>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', position: 'sticky', top: 80, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
              {/* Filter Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>Filters</span>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} style={{ fontSize: 13, color: '#E82127', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                    Clear All
                  </button>
                )}
              </div>

              {/* Discount Toggle */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={onlyDiscounted}
                    onChange={e => { setOnlyDiscounted(e.target.checked); setPage(1); }}
                    style={{ width: 18, height: 18, accentColor: '#16a34a' }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>
                    On Sale Only
                  </span>
                  <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginLeft: 'auto' }}>
                    {discountedCount}
                  </span>
                </label>
              </div>

              {/* Price Range */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 12 }}>Price Range</div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 4 }}>Min</label>
                    <input
                      type="number"
                      value={priceMin}
                      onChange={e => { setPriceMin(Number(e.target.value)); setPage(1); }}
                      style={{ width: '100%', padding: '8px 12px', fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 6 }}
                      min={0}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 4 }}>Max</label>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={e => { setPriceMax(Number(e.target.value)); setPage(1); }}
                      style={{ width: '100%', padding: '8px 12px', fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 6 }}
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
                  style={{ width: '100%', accentColor: '#E82127' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                  <span>$0</span>
                  <span>${stats.maxPrice?.toLocaleString() || '5,000'}</span>
                </div>
              </div>

              {/* Tesla Models */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 12 }}>Tesla Model</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stats.models.map(model => (
                    <label key={model} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model)}
                        onChange={() => toggleModel(model)}
                        style={{ width: 16, height: 16, accentColor: '#E82127' }}
                      />
                      <span style={{ fontSize: 13, color: '#374151' }}>{MODEL_LABELS[model] || model}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', maxHeight: 250, overflowY: 'auto' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 12 }}>Category</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stats.categories.map(cat => (
                    <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        style={{ width: 16, height: 16, accentColor: '#E82127' }}
                      />
                      <span style={{ fontSize: 13, color: '#374151' }}>{formatCategory(cat)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stores */}
              <div style={{ padding: '16px 20px', maxHeight: 200, overflowY: 'auto' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 12 }}>Store</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stats.sources.map(source => (
                    <label key={source} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedSources.includes(source)}
                        onChange={() => toggleSource(source)}
                        style={{ width: 16, height: 16, accentColor: '#E82127' }}
                      />
                      <span style={{ fontSize: 13, color: '#374151' }}>{source}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Active Filters & Results Count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: '#6b7280' }}>
                <strong style={{ color: '#111' }}>{filteredProducts.length.toLocaleString()}</strong> products
              </span>

              {/* Active Filter Pills */}
              {selectedModels.map(m => (
                <span key={m} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 500, borderRadius: 20 }}>
                  {MODEL_LABELS[m] || m}
                  <button onClick={() => toggleModel(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#dc2626' }}>×</button>
                </span>
              ))}
              {selectedCategories.map(c => (
                <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 500, borderRadius: 20 }}>
                  {formatCategory(c)}
                  <button onClick={() => toggleCategory(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#92400e' }}>×</button>
                </span>
              ))}
              {selectedSources.map(s => (
                <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#dbeafe', color: '#1d4ed8', fontSize: 12, fontWeight: 500, borderRadius: 20 }}>
                  {s}
                  <button onClick={() => toggleSource(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#1d4ed8' }}>×</button>
                </span>
              ))}
              {onlyDiscounted && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 500, borderRadius: 20 }}>
                  On Sale
                  <button onClick={() => setOnlyDiscounted(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#16a34a' }}>×</button>
                </span>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {viewMode === 'products' && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: showFilters ? 'repeat(auto-fill, minmax(220px, 1fr))' : 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 16
              }}>
                {paginatedProducts.map((p, idx) => {
                  const discount = getDiscountInfo(p.url);
                  const affiliateUrl = getAffiliateUrl(p.url);
                  return (
                    <div
                      key={idx}
                      style={{
                        background: '#fff',
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Link
                        href={`/product/${generateSlug(p.title)}`}
                        style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
                      >
                        <div style={{ position: 'relative' }}>
                          {p.image && (
                            <div style={{ aspectRatio: '4/3', background: '#f9fafb', overflow: 'hidden' }}>
                              <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                            </div>
                          )}
                          {discount && (
                            <div style={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              background: '#16a34a',
                              color: '#fff',
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700
                            }}>
                              {discount.percent}% OFF
                            </div>
                          )}
                        </div>
                        <div style={{ padding: 14 }}>
                          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                            <span>{p.source}</span>
                            {p.models?.filter(m => m !== 'universal').slice(0, 1).map(m => (
                              <span key={m} style={{ color: '#9ca3af' }}>{MODEL_LABELS[m]?.split(' ')[1] || m}</span>
                            ))}
                          </div>
                          <h3 style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#111',
                            marginBottom: 10,
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: 40
                          }}>
                            {p.title}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            {discount ? (
                              <>
                                <span style={{ fontSize: 18, fontWeight: 700, color: '#16a34a' }}>
                                  ${(p.price * (1 - discount.percent / 100)).toFixed(0)}
                                </span>
                                <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>
                                  ${p.price.toFixed(0)}
                                </span>
                              </>
                            ) : (
                              <span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>${p.price.toFixed(0)}</span>
                            )}
                          </div>
                          {discount && (
                            <div style={{
                              marginTop: 8,
                              padding: '6px 10px',
                              background: '#f0fdf4',
                              borderRadius: 6,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{ fontSize: 11, color: '#16a34a' }}>Use code:</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d', fontFamily: 'monospace' }}>
                                {discount.code}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                      <div style={{ padding: '0 14px 14px' }}>
                        <a
                          href={affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px',
                            background: '#E82127',
                            color: '#fff',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            textDecoration: 'none',
                            textAlign: 'center'
                          }}
                        >
                          Visit {p.source} →
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 32 }}>
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    style={{
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: 500,
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      background: '#fff',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      opacity: page === 1 ? 0.5 : 1
                    }}
                  >
                    First
                  </button>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      padding: '10px 20px',
                      fontSize: 13,
                      fontWeight: 500,
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      background: '#fff',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      opacity: page === 1 ? 0.5 : 1
                    }}
                  >
                    ← Prev
                  </button>
                  <div style={{
                    padding: '10px 24px',
                    fontSize: 14,
                    fontWeight: 600,
                    background: '#111',
                    color: '#fff',
                    borderRadius: 8
                  }}>
                    {page} / {totalPages}
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      padding: '10px 20px',
                      fontSize: 13,
                      fontWeight: 500,
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      background: '#fff',
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      opacity: page === totalPages ? 0.5 : 1
                    }}
                  >
                    Next →
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    style={{
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: 500,
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      background: '#fff',
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      opacity: page === totalPages ? 0.5 : 1
                    }}
                  >
                    Last
                  </button>
                </div>
              )}
            </>
          )}

          {/* Comparisons View */}
          {viewMode === 'comparisons' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: showFilters ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16
            }}>
              {filteredMatches.map((match) => (
                <article
                  key={match.matchKey}
                  onClick={() => setSelectedMatch(match)}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  {match.products[0]?.image && (
                    <div style={{ aspectRatio: '16/10', background: '#f9fafb', overflow: 'hidden', position: 'relative' }}>
                      <img src={match.products[0].image} alt={match.products[0].title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 8, right: 8, background: '#16a34a', color: '#fff', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
                        Save {match.savingsPercent}%
                      </div>
                    </div>
                  )}
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 11, padding: '4px 8px', background: '#fef3c7', color: '#92400e', borderRadius: 4, fontWeight: 600 }}>
                        {match.products.length} stores
                      </span>
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {match.products[0]?.title}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <span style={{ fontSize: 11, color: '#6b7280' }}>Best price</span>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#16a34a' }}>${match.lowestPrice.toFixed(0)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 11, color: '#6b7280' }}>You save</span>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>${match.savings.toFixed(0)}</div>
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
          <div onClick={() => setSelectedMatch(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 600, maxHeight: '85vh', background: '#fff', borderRadius: 16, overflow: 'hidden', zIndex: 201 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{selectedMatch.products[0]?.title}</h2>
                <p style={{ fontSize: 13, color: '#6b7280' }}>{selectedMatch.products.length} stores compared</p>
              </div>
              <button onClick={() => setSelectedMatch(null)} style={{ background: '#f3f4f6', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid #e5e7eb' }}>
              {[
                { l: 'Best Price', v: `$${selectedMatch.lowestPrice.toFixed(0)}`, c: '#16a34a' },
                { l: 'Highest', v: `$${selectedMatch.highestPrice.toFixed(0)}`, c: '#9ca3af' },
                { l: 'You Save', v: `$${selectedMatch.savings.toFixed(0)}`, c: '#E82127' }
              ].map((x, i) => (
                <div key={i} style={{ padding: 16, textAlign: 'center', borderRight: i < 2 ? '1px solid #e5e7eb' : 'none' }}>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{x.l}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: x.c }}>{x.v}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: 20, maxHeight: 'calc(85vh - 180px)', overflowY: 'auto' }}>
              {selectedMatch.products.sort((a, b) => a.price - b.price).map((p, i) => {
                const discountInfo = getDiscountInfo(p.url);
                const affiliateUrl = getAffiliateUrl(p.url);

                return (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 16px', background: i === 0 ? '#f0fdf4' : '#f9fafb', borderRadius: 10, marginBottom: 10, border: i === 0 ? '2px solid #86efac' : '1px solid #e5e7eb', alignItems: 'center' }}>
                    {p.image && (
                      <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb' }}>
                        <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{p.source}</span>
                          {i === 0 && <span style={{ fontSize: 10, padding: '3px 8px', background: '#16a34a', color: '#fff', borderRadius: 4, fontWeight: 700 }}>BEST PRICE</span>}
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 700, color: i === 0 ? '#16a34a' : '#111' }}>${p.price.toFixed(2)}</span>
                      </div>
                      {discountInfo && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 500 }}>
                            Extra {discountInfo.percent}% off with code:
                          </span>
                          <span style={{ fontSize: 13, fontFamily: 'monospace', background: '#dcfce7', padding: '3px 8px', borderRadius: 4, fontWeight: 700, color: '#15803d' }}>
                            {discountInfo.code}
                          </span>
                        </div>
                      )}
                    </div>
                    <a
                      href={affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px 20px',
                        background: i === 0 ? '#16a34a' : '#E82127',
                        color: '#fff',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      Visit →
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
