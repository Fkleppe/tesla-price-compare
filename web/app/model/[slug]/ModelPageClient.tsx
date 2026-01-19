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
import { CATEGORIES, ITEMS_PER_PAGE } from '@/lib/constants';

interface ModelPageClientProps {
  model: {
    id: string;
    name: string;
    shortName: string;
  };
  initialProducts: Product[];
}

export default function ModelPageClient({ model, initialProducts }: ModelPageClientProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(5000);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'discount-desc'>('price-asc');
  const [page, setPage] = useState(1);

  const filteredProducts = useMemo(() => {
    let filtered = initialProducts.filter(p =>
      isAffiliatePartner(p.url) &&
      p.models?.includes(model.id)
    );

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
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
  }, [initialProducts, model.id, selectedCategories, priceMin, priceMax, sortBy]);

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

  // Get available categories for this model
  const availableCategories = useMemo(() => {
    const modelProducts = initialProducts.filter(p =>
      isAffiliatePartner(p.url) && p.models?.includes(model.id)
    );
    const cats = new Set(modelProducts.map(p => p.category));
    return CATEGORIES.filter(c => cats.has(c.id));
  }, [initialProducts, model.id]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
    setPage(1);
  };

  // Top categories for quick navigation
  const topCategories = availableCategories.slice(0, 6);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <ItemListJsonLd items={paginatedProducts} listName={`Accessories for Tesla ${model.name}`} />
      <Header stats={stats} />

      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px' }}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Tesla Models', href: '/model' },
            { label: model.name },
          ]}
        />

        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #E82127 0%, #b91c1c 100%)',
          borderRadius: 16,
          padding: '48px',
          marginBottom: 32,
          color: '#fff',
        }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Tesla {model.name} Accessories
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', maxWidth: 600, lineHeight: 1.6 }}>
            Find the best accessories specifically designed for your Tesla {model.name}.
            Compare prices and get exclusive discount codes.
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{filteredProducts.length}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Products</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                {filteredProducts.filter(p => getDiscountInfo(p.url)).length}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>On Sale</div>
            </div>
          </div>
        </section>

        {/* Quick Category Links */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 16 }}>
            Shop by Category
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {topCategories.map(cat => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}?model=${model.id}`}
                style={{
                  padding: '12px 20px',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  color: '#374151',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', gap: 24 }}>
          {/* Sidebar Filters */}
          <aside style={{ width: 260, flexShrink: 0 }}>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              position: 'sticky',
              top: 80,
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>Filter Results</span>
              </div>

              {/* Categories */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', maxHeight: 300, overflowY: 'auto' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 12 }}>Category</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {availableCategories.map(cat => (
                    <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        style={{ width: 16, height: 16, accentColor: '#E82127' }}
                      />
                      <span style={{ fontSize: 13, color: '#374151' }}>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

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
                Tesla {model.name} Accessories Guide
              </h2>
              <div style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8 }}>
                <p style={{ marginBottom: 16 }}>
                  Upgrade your Tesla {model.name} with our curated selection of premium accessories.
                  From protective floor mats to advanced charging solutions, we've gathered the best
                  products from trusted retailers to help you customize and protect your vehicle.
                </p>
                <p style={{ marginBottom: 16 }}>
                  Every product listed is compatible with your {model.name}, so you can shop with confidence.
                  Use our price comparison tool to find the best deals and take advantage of exclusive
                  discount codes that can save you up to 20% on your purchase.
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111', marginTop: 24, marginBottom: 12 }}>
                  Popular Accessories for Tesla {model.name}
                </h3>
                <ul style={{ paddingLeft: 20 }}>
                  <li style={{ marginBottom: 8 }}>All-weather floor mats for year-round protection</li>
                  <li style={{ marginBottom: 8 }}>Screen protectors to keep your touchscreen pristine</li>
                  <li style={{ marginBottom: 8 }}>Center console wraps and organizers</li>
                  <li style={{ marginBottom: 8 }}>Charging cables and wall connectors</li>
                  <li style={{ marginBottom: 8 }}>Sunshades for interior climate control</li>
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
