'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { ItemListJsonLd } from '@/components/JsonLd';
import { Product } from '@/lib/types';
import { isAffiliatePartner, getDiscountInfo } from '@/lib/affiliate';
import { TESLA_MODELS, CATEGORIES, ITEMS_PER_PAGE } from '@/lib/constants';

interface CategoryPageClientProps {
  category: {
    id: string;
    name: string;
    description: string;
  };
  initialProducts: Product[];
}

export default function CategoryPageClient({ category, initialProducts }: CategoryPageClientProps) {
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

  const stats = useMemo(() => {
    const partnerProducts = initialProducts.filter(p => isAffiliatePartner(p.url));
    const sources = new Set(partnerProducts.map(p => p.source));
    const discounted = partnerProducts.filter(p => getDiscountInfo(p.url) !== null);
    return {
      totalProducts: partnerProducts.length,
      totalStores: sources.size,
      discountedCount: discounted.length,
    };
  }, [initialProducts]);

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

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <ItemListJsonLd items={paginatedProducts} listName={`${category.name} for Tesla`} />
      <Header stats={stats} />

      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px' }}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Categories', href: '/category' },
            { label: category.name },
          ]}
        />

        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: 16,
          padding: '48px',
          marginBottom: 32,
          color: '#fff',
        }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            {category.name} for Tesla
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 600, lineHeight: 1.6 }}>
            {category.description}. Compare prices from {stats.totalStores} stores and find the best deals.
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{filteredProducts.length}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Products</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#4ade80' }}>
                {filteredProducts.filter(p => getDiscountInfo(p.url)).length}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>On Sale</div>
            </div>
          </div>
        </section>

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
                      transition: 'background 0.2s',
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
            {/* Sort & Results */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <p style={{ fontSize: 14, color: '#6b7280' }}>
                <strong style={{ color: '#111' }}>{filteredProducts.length}</strong> products found
              </p>
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

            {/* SEO Content */}
            <section style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              padding: 32,
              marginTop: 48,
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 16 }}>
                About {category.name} for Tesla Vehicles
              </h2>
              <div style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8 }}>
                <p style={{ marginBottom: 16 }}>
                  {category.description}. Whether you own a Model 3, Model Y, Model S, Model X, or Cybertruck,
                  we compare {category.name.toLowerCase()} from multiple stores so you can find what fits your car and budget.
                </p>
                <p style={{ marginBottom: 16 }}>
                  Our price comparison tool helps you find the lowest prices across multiple stores,
                  and many products come with exclusive discount codes that can save you up to 20% off.
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111', marginTop: 24, marginBottom: 12 }}>
                  Why Shop for {category.name} with EVPriceHunt?
                </h3>
                <ul style={{ paddingLeft: 20 }}>
                  <li style={{ marginBottom: 8 }}>Compare prices from {stats.totalStores}+ verified Tesla accessory stores</li>
                  <li style={{ marginBottom: 8 }}>Access exclusive discount codes unavailable elsewhere</li>
                  <li style={{ marginBottom: 8 }}>Filter by Tesla model for perfect compatibility</li>
                  <li style={{ marginBottom: 8 }}>Read reviews and find the highest-rated products</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
