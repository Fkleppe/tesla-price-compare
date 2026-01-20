'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getAffiliateUrl, getDiscountInfo, isAffiliatePartner } from '@/lib/affiliate';
import { TOP_10_LISTS, MODEL_LABELS, generateSlug } from '@/lib/constants';

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

interface TopList {
  id: string;
  title: string;
  description: string;
  keywords: readonly string[];
  models?: readonly string[];
}

interface Top10ListClientProps {
  list: TopList;
}

export default function Top10ListClient({ list }: Top10ListClientProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getTopProducts = (listData: TopList): Product[] => {
    let filtered = products.filter(p => isAffiliatePartner(p.url));

    // Filter by keywords
    filtered = filtered.filter(p => {
      const titleLower = p.title.toLowerCase();
      return listData.keywords.some(kw => titleLower.includes(kw.toLowerCase()));
    });

    // Filter by models if specified
    if (listData.models && listData.models.length > 0) {
      filtered = filtered.filter(p => p.models?.some(m => listData.models!.includes(m)));
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

  const topProducts = useMemo(() => getTopProducts(list), [products, list]);

  const stats = useMemo(() => {
    const partnerProducts = products.filter(p => isAffiliatePartner(p.url));
    const sources = new Set(partnerProducts.map(p => p.source));
    const discounted = partnerProducts.filter(p => getDiscountInfo(p.url) !== null);
    return {
      totalProducts: partnerProducts.length,
      totalStores: sources.size,
      discountedCount: discounted.length,
    };
  }, [products]);

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
      <Header stats={stats} />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Top 10 Lists', href: '/top-10' },
            { label: list.title },
          ]}
        />

        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: 16,
          padding: '48px',
          marginBottom: 32,
          color: '#fff',
        }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            {list.title}
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 700, lineHeight: 1.6 }}>
            {list.description}
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600
            }}>
              {topProducts.length} Products Ranked
            </div>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600
            }}>
              Updated January 2025
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', gap: 32 }}>
          {/* Sidebar - Other Lists */}
          <aside style={{ width: 280, flexShrink: 0 }}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              position: 'sticky',
              top: 80,
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto',
            }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>All Top 10 Lists</h2>
              </div>
              <div style={{ padding: '8px' }}>
                {TOP_10_LISTS.map(item => (
                  <Link
                    key={item.id}
                    href={`/top-10/${item.id}`}
                    style={{
                      display: 'block',
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: list.id === item.id ? '#fee2e2' : 'transparent',
                      color: list.id === item.id ? '#dc2626' : '#374151',
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: list.id === item.id ? 600 : 500,
                    }}
                  >
                    {item.title.replace('Best ', '')}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div style={{ flex: 1 }}>
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
                              alt={`${product.title} - Rank #${index + 1} in ${list.title}`}
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
                            {index === 0 && "Top pick based on reviews, materials, and price."}
                            {index === 1 && 'Runner Up - Excellent alternative with great features.'}
                            {index === 2 && 'Good balance of price and customer ratings.'}
                            {index > 2 && 'Well-reviewed by Tesla owners.'}
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

            {/* SEO Content Section */}
            <section style={{
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              padding: '32px',
              marginTop: 32
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 16 }}>
                About {list.title}
              </h2>
              <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, marginBottom: 16 }}>
                {list.description} We've carefully evaluated dozens of products to bring you the top 10 best options
                available in 2025. We rank based on customer reviews, materials,
                compatibility across Tesla models, and overall value for money.
              </p>
              <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7 }}>
                Many products on this list come with exclusive discount codes that can save you up to 20%
                off the regular price. We partner directly with trusted Tesla accessory retailers to bring
                you the best deals. All products are available from verified sellers with established
                return policies.
              </p>

              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 12 }}>
                  Browse More Top 10 Lists
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TOP_10_LISTS.filter(l => l.id !== list.id).slice(0, 5).map(l => (
                    <Link
                      key={l.id}
                      href={`/top-10/${l.id}`}
                      style={{
                        padding: '8px 16px',
                        background: '#f3f4f6',
                        borderRadius: 8,
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: 500
                      }}
                    >
                      {l.title}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
