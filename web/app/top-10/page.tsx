'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getAffiliateUrl, getDiscountInfo, isAffiliatePartner } from '../../lib/affiliate';

interface Product {
  title: string;
  price: number;
  currency: string;
  url: string;
  image: string;
  source: string;
  sourceId: string;
  category: string;
  models: string[];
  description?: string;
  vendor?: string;
}

const MODEL_LABELS: Record<string, string> = {
  'model-3': 'Model 3',
  'highland': 'Model 3 Highland',
  'model-y': 'Model Y',
  'juniper': 'Model Y Juniper',
  'model-s': 'Model S',
  'model-x': 'Model X',
  'cybertruck': 'Cybertruck',
  'universal': 'Universal',
};

interface TopList {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  models?: string[];
}

const TOP_LISTS: TopList[] = [
  {
    id: 'mattress',
    title: 'Best Tesla Mattresses',
    description: 'Sleep comfortably on road trips with these top-rated Tesla mattresses for camping and travel.',
    keywords: ['mattress', 'camping mattress', 'air mattress', 'sleeping pad'],
  },
  {
    id: 'tent',
    title: 'Best Tesla Camping Tents',
    description: 'Turn your Tesla into a camping adventure with these premium tent attachments.',
    keywords: ['tent', 'camping tent', 'car tent', 'tailgate tent'],
  },
  {
    id: 'floor-mats',
    title: 'Best Floor Mats',
    description: 'Protect your Tesla interior with all-weather floor mats that fit perfectly.',
    keywords: ['floor mat', 'floor liner', 'all-weather mat', 'floor mats'],
  },
  {
    id: 'screen-protector',
    title: 'Best Screen Protectors',
    description: 'Keep your Tesla touchscreen scratch-free with these premium screen protectors.',
    keywords: ['screen protector', 'tempered glass', 'touch screen', 'screen film'],
  },
  {
    id: 'center-console',
    title: 'Best Center Console Accessories',
    description: 'Organize and protect your center console with these must-have accessories.',
    keywords: ['center console', 'console wrap', 'console cover', 'armrest'],
  },
  {
    id: 'charger',
    title: 'Best Charging Accessories',
    description: 'Charge faster and smarter with these top charging solutions for your Tesla.',
    keywords: ['charger', 'charging', 'wall connector', 'mobile connector', 'nema'],
  },
  {
    id: 'sunshade',
    title: 'Best Sunshades',
    description: 'Keep your Tesla cool with these effective sunshades and window covers.',
    keywords: ['sunshade', 'sun shade', 'windshield shade', 'roof shade', 'window shade'],
  },
  {
    id: 'wheel-covers',
    title: 'Best Wheel Covers & Caps',
    description: 'Upgrade your Tesla wheels with stylish covers and aero caps.',
    keywords: ['wheel cover', 'hub cap', 'hubcap', 'wheel cap', 'aero cover', 'aero wheel'],
  },
  {
    id: 'trunk-organizer',
    title: 'Best Trunk Organizers',
    description: 'Maximize your trunk space with these clever storage solutions.',
    keywords: ['trunk organizer', 'cargo net', 'trunk mat', 'frunk', 'trunk storage'],
  },
  {
    id: 'phone-mount',
    title: 'Best Phone Mounts & Chargers',
    description: 'Keep your phone secure and charged with these wireless mounts.',
    keywords: ['phone mount', 'phone holder', 'wireless charger', 'magsafe', 'phone stand'],
  },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

export default function Top10Page() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeList, setActiveList] = useState<string>('mattress');
  const [showTop10Menu, setShowTop10Menu] = useState(false);

  // Set initial list from URL query param
  useEffect(() => {
    const listParam = searchParams.get('list');
    if (listParam && TOP_LISTS.some(l => l.id === listParam)) {
      setActiveList(listParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getTopProducts = (list: TopList): Product[] => {
    let filtered = products.filter(p => isAffiliatePartner(p.url));

    // Filter by keywords
    filtered = filtered.filter(p => {
      const titleLower = p.title.toLowerCase();
      return list.keywords.some(kw => titleLower.includes(kw.toLowerCase()));
    });

    // Filter by models if specified
    if (list.models && list.models.length > 0) {
      filtered = filtered.filter(p => p.models?.some(m => list.models!.includes(m)));
    }

    // Sort by: has discount first, then by price
    filtered.sort((a, b) => {
      const aDiscount = getDiscountInfo(a.url)?.percent || 0;
      const bDiscount = getDiscountInfo(b.url)?.percent || 0;
      if (bDiscount !== aDiscount) return bDiscount - aDiscount;
      return a.price - b.price;
    });

    return filtered.slice(0, 10);
  };

  const currentList = TOP_LISTS.find(l => l.id === activeList) || TOP_LISTS[0];
  const topProducts = useMemo(() => getTopProducts(currentList), [products, currentList]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #e5e7eb', borderTopColor: '#E82127', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280', fontSize: 15 }}>Loading top products...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <header style={{ background: '#0a0a0a', padding: '14px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 20, fontWeight: 700 }}>
              Tesla<span style={{ color: '#E82127' }}>Compare</span>
            </Link>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <Link href="/" style={{ color: '#a3a3a3', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                All Products
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
                    fontSize: 14,
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
                    <button
                      onClick={() => { setActiveList('mattress'); setShowTop10Menu(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '12px 16px',
                        color: '#111',
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: 600,
                        borderBottom: '1px solid #e5e7eb',
                        background: 'none',
                        border: 'none',
                        borderBottomWidth: 1,
                        borderBottomStyle: 'solid',
                        borderBottomColor: '#e5e7eb',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      All Top 10 Lists
                    </button>
                    {TOP_LISTS.map(list => (
                      <button
                        key={list.id}
                        onClick={() => { setActiveList(list.id); setShowTop10Menu(false); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '10px 16px',
                          color: activeList === list.id ? '#E82127' : '#374151',
                          background: activeList === list.id ? '#fef2f2' : 'transparent',
                          fontSize: 13,
                          fontWeight: activeList === list.id ? 600 : 500,
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={e => { if (activeList !== list.id) e.currentTarget.style.background = '#f3f4f6'; }}
                        onMouseLeave={e => { if (activeList !== list.id) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {list.title.replace('Best ', '')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: '48px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
            Top 10 Tesla Accessories
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            Curated lists of the best accessories for your Tesla, handpicked based on quality, reviews, and value.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: 32 }}>
          {/* Sidebar - List Selection */}
          <aside style={{ width: 280, flexShrink: 0 }}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              position: 'sticky',
              top: 80
            }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Browse Lists</h2>
              </div>
              <div style={{ padding: '8px' }}>
                {TOP_LISTS.map(list => (
                  <button
                    key={list.id}
                    onClick={() => setActiveList(list.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: 10,
                      background: activeList === list.id ? '#fee2e2' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{
                      fontSize: 14,
                      fontWeight: activeList === list.id ? 600 : 500,
                      color: activeList === list.id ? '#dc2626' : '#374151'
                    }}>
                      {list.title.replace('Best ', '')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main style={{ flex: 1 }}>
            {/* List Header */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              padding: '28px 32px',
              marginBottom: 24
            }}>
              <div style={{ marginBottom: 12 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: 8 }}>
                  {currentList.title}
                </h1>
                <p style={{ fontSize: 15, color: '#6b7280' }}>
                  {currentList.description}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                <div style={{
                  padding: '8px 16px',
                  background: '#f0fdf4',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#16a34a',
                  fontWeight: 600
                }}>
                  {topProducts.length} Products Found
                </div>
                <div style={{
                  padding: '8px 16px',
                  background: '#fef3c7',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#92400e',
                  fontWeight: 600
                }}>
                  Updated January 2025
                </div>
              </div>
            </div>

            {/* Product List */}
            {topProducts.length === 0 ? (
              <div style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                padding: '48px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: 16, color: '#6b7280' }}>
                  No products found in this category. Check back soon!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {topProducts.map((product, index) => {
                  const discount = getDiscountInfo(product.url);
                  const affiliateUrl = getAffiliateUrl(product.url);
                  const discountedPrice = discount
                    ? (product.price * (1 - discount.percent / 100)).toFixed(2)
                    : null;

                  return (
                    <article
                      key={index}
                      style={{
                        background: '#fff',
                        borderRadius: 16,
                        border: index === 0 ? '2px solid #fbbf24' : '1px solid #e5e7eb',
                        overflow: 'hidden',
                        display: 'flex',
                        position: 'relative'
                      }}
                    >
                      {/* Rank Badge */}
                      <div style={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: index === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
                                   index === 1 ? 'linear-gradient(135deg, #d1d5db, #9ca3af)' :
                                   index === 2 ? 'linear-gradient(135deg, #d97706, #b45309)' :
                                   '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        fontWeight: 800,
                        color: index < 3 ? '#fff' : '#374151',
                        boxShadow: index < 3 ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                        zIndex: 10
                      }}>
                        #{index + 1}
                      </div>

                      {/* Image */}
                      <div style={{ width: 220, flexShrink: 0, position: 'relative' }}>
                        {product.image && (
                          <div style={{ aspectRatio: '1', background: '#f9fafb' }}>
                            <img
                              src={product.image}
                              alt={product.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        {discount && (
                          <div style={{
                            position: 'absolute',
                            bottom: 12,
                            left: 12,
                            background: '#16a34a',
                            color: '#fff',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 13,
                            fontWeight: 700
                          }}>
                            {discount.percent}% OFF
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1 }}>
                          {/* Store & Model Tags */}
                          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '4px 10px',
                              background: '#111',
                              color: '#fff',
                              borderRadius: 4
                            }}>
                              {product.source}
                            </span>
                            {product.models?.filter(m => m !== 'universal').slice(0, 2).map(m => (
                              <span key={m} style={{
                                fontSize: 11,
                                fontWeight: 500,
                                padding: '4px 10px',
                                background: '#f3f4f6',
                                color: '#374151',
                                borderRadius: 4
                              }}>
                                {MODEL_LABELS[m] || m}
                              </span>
                            ))}
                          </div>

                          {/* Title */}
                          <h3 style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: '#111',
                            marginBottom: 8,
                            lineHeight: 1.4
                          }}>
                            {product.title}
                          </h3>

                          {/* Why We Love It */}
                          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 16 }}>
                            {index === 0 && 'Editor\'s Choice - Best overall value and quality in this category.'}
                            {index === 1 && 'Runner Up - Excellent alternative with great features.'}
                            {index === 2 && 'Best Value - Great quality at an affordable price point.'}
                            {index > 2 && 'Highly rated by Tesla owners for quality and fitment.'}
                          </p>
                        </div>

                        {/* Price & CTA */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                          <div>
                            {discount ? (
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                                <span style={{ fontSize: 28, fontWeight: 800, color: '#16a34a' }}>
                                  ${discountedPrice}
                                </span>
                                <span style={{ fontSize: 16, color: '#9ca3af', textDecoration: 'line-through' }}>
                                  ${product.price.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: 28, fontWeight: 800, color: '#111' }}>
                                ${product.price.toFixed(2)}
                              </span>
                            )}
                            {discount && (
                              <div style={{ marginTop: 6 }}>
                                <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 500 }}>
                                  Use code:
                                </span>
                                <span style={{
                                  marginLeft: 6,
                                  fontSize: 13,
                                  fontFamily: 'monospace',
                                  background: '#dcfce7',
                                  padding: '3px 8px',
                                  borderRadius: 4,
                                  fontWeight: 700,
                                  color: '#15803d'
                                }}>
                                  {discount.code}
                                </span>
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: 10 }}>
                            <Link
                              href={`/product/${generateSlug(product.title)}`}
                              style={{
                                padding: '12px 20px',
                                border: '2px solid #e5e7eb',
                                borderRadius: 10,
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#374151',
                                textDecoration: 'none'
                              }}
                            >
                              Details
                            </Link>
                            <a
                              href={affiliateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '12px 24px',
                                background: '#E82127',
                                borderRadius: 10,
                                fontSize: 14,
                                fontWeight: 700,
                                color: '#fff',
                                textDecoration: 'none',
                                boxShadow: '0 4px 14px rgba(232, 33, 39, 0.3)'
                              }}
                            >
                              {discount ? `Get ${discount.percent}% Off` : 'Buy Now'}
                              <span>→</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#0a0a0a', color: '#9ca3af', padding: '48px 24px', marginTop: 64 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
            Tesla<span style={{ color: '#E82127' }}>Compare</span>
          </div>
          <p style={{ fontSize: 13, marginBottom: 8 }}>
            Find the best deals on Tesla accessories with exclusive discount codes.
          </p>
          <p style={{ fontSize: 12 }}>© 2025 TeslaCompare. Not affiliated with Tesla, Inc.</p>
        </div>
      </footer>
    </div>
  );
}
