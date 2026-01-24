'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { isAffiliatePartner, getDiscountInfo } from '@/lib/affiliate';
import { TESLA_MODELS, CATEGORIES, ITEMS_PER_PAGE } from '@/lib/constants';

interface CategoryPageInteractiveProps {
  category: {
    id: string;
    name: string;
    description: string;
  };
  initialProducts: Product[];
}

export default function CategoryPageInteractive({ category, initialProducts }: CategoryPageInteractiveProps) {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(5000);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'discount-desc'>('price-asc');
  const [page, setPage] = useState(1);

  // Get available stores for this category
  const availableStores = useMemo(() => {
    const categoryProducts = initialProducts.filter(p =>
      isAffiliatePartner(p.url) && p.category === category.id
    );
    const stores = [...new Set(categoryProducts.map(p => p.source))].sort();
    return stores;
  }, [initialProducts, category.id]);

  const filteredProducts = useMemo(() => {
    let filtered = initialProducts.filter(p =>
      isAffiliatePartner(p.url) &&
      p.category === category.id
    );

    if (selectedModels.length > 0) {
      filtered = filtered.filter(p => p.models?.some(m => selectedModels.includes(m)));
    }

    if (selectedStores.length > 0) {
      filtered = filtered.filter(p => selectedStores.includes(p.source));
    }

    if (onSaleOnly) {
      filtered = filtered.filter(p => getDiscountInfo(p.url) !== null);
    }

    filtered = filtered.filter(p => p.price >= priceMin && p.price <= priceMax);

    switch (sortBy) {
      case 'price-asc':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'discount-desc':
        filtered = [...filtered].sort((a, b) => {
          const dA = getDiscountInfo(a.url)?.percent || 0;
          const dB = getDiscountInfo(b.url)?.percent || 0;
          return dB - dA;
        });
        break;
    }

    return filtered;
  }, [initialProducts, category.id, selectedModels, selectedStores, onSaleOnly, priceMin, priceMax, sortBy]);

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const toggleModel = (model: string) => {
    setSelectedModels(prev =>
      prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]
    );
    setPage(1);
  };

  const toggleStore = (store: string) => {
    setSelectedStores(prev =>
      prev.includes(store) ? prev.filter(s => s !== store) : [...prev, store]
    );
    setPage(1);
  };

  const relatedCategories = CATEGORIES.filter(c => c.id !== category.id).slice(0, 5);

  // Don't render filters section if there are no products beyond the initial SSR ones
  const hasFiltersActive = selectedModels.length > 0 || selectedStores.length > 0 || onSaleOnly || priceMin > 0 || priceMax < 5000;

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* Sidebar Filters */}
      <aside style={{ width: 260, flexShrink: 0 }}>
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          position: 'sticky',
          top: 80,
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>Filter Results</span>
          </div>

          {/* On Sale Only Toggle */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={() => { setOnSaleOnly(!onSaleOnly); setPage(1); }}
                style={{ width: 16, height: 16, accentColor: '#16a34a' }}
              />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#16a34a' }}>On Sale Only</span>
            </label>
          </div>

          {/* Tesla Models */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 12 }}>Tesla Model</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TESLA_MODELS.filter(m => m.id !== 'universal').map(model => (
                <label key={model.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model.id)}
                    onChange={() => toggleModel(model.id)}
                    style={{ width: 16, height: 16, accentColor: '#E82127' }}
                  />
                  <span style={{ fontSize: 13, color: '#374151' }}>{model.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Store Filter */}
          {availableStores.length > 1 && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 12 }}>Store</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {availableStores.map(store => (
                  <label key={store} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedStores.includes(store)}
                      onChange={() => toggleStore(store)}
                      style={{ width: 16, height: 16, accentColor: '#E82127' }}
                    />
                    <span style={{ fontSize: 13, color: '#374151' }}>{store}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 12 }}>Price Range</div>
            <div style={{ display: 'flex', gap: 12 }}>
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
          </div>
        </div>

        {/* Related Categories */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          marginTop: 16,
          padding: 20,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 16 }}>
            Related Categories
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {relatedCategories.map(cat => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                style={{
                  color: '#374151',
                  textDecoration: 'none',
                  fontSize: 13,
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: '#f9fafb',
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Sort & Results Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          padding: '16px 20px',
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: 0 }}>
              {hasFiltersActive ? 'Filtered Results' : 'All Products'}
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0 0' }}>
              <strong style={{ color: '#111' }}>{filteredProducts.length}</strong> products found
            </p>
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            style={{
              padding: '10px 16px',
              fontSize: 14,
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="discount-desc">Biggest Discount</option>
          </select>
        </div>

        {/* Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {paginatedProducts.map((product, idx) => (
            <ProductCard
              key={product.sourceId || idx}
              product={product}
              priority={idx < 8}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            marginTop: 32,
          }}>
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
                opacity: page === 1 ? 0.5 : 1,
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
                opacity: page === 1 ? 0.5 : 1,
              }}
            >
              Prev
            </button>
            <div style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              background: '#111',
              color: '#fff',
              borderRadius: 8,
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
                opacity: page === totalPages ? 0.5 : 1,
              }}
            >
              Next
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
                opacity: page === totalPages ? 0.5 : 1,
              }}
            >
              Last
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
