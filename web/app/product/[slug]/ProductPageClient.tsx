'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getAffiliateUrl, getDiscountInfo, isAffiliatePartner } from '../../../lib/affiliate';

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

const MODEL_YEARS: Record<string, string> = {
  'model-3': '2017-2023',
  'highland': '2024+',
  'model-y': '2020-2024',
  'juniper': '2025+',
  'model-s': '2012+',
  'model-x': '2015+',
  'cybertruck': '2024+',
  'universal': 'All Years',
};

const CATEGORY_BENEFITS: Record<string, string[]> = {
  'floor-mats': ['Protects original carpet', 'Easy to clean', 'Custom fit design', 'All-weather protection'],
  'screen-protector': ['Anti-glare coating', 'Scratch resistant', 'Easy installation', 'Crystal clear display'],
  'center-console': ['Premium materials', 'Perfect fit', 'Scratch protection', 'Enhanced aesthetics'],
  'charging': ['Fast charging speeds', 'Safety certified', 'Durable construction', 'Easy installation'],
  'exterior': ['Weather resistant', 'UV protection', 'Easy to install', 'OEM quality'],
  'interior': ['Premium quality', 'Perfect fit', 'Easy installation', 'Enhanced comfort'],
  'wheels': ['Lightweight design', 'Improved range', 'OEM compatible', 'Stylish appearance'],
  'lighting': ['Bright LED output', 'Easy installation', 'Long lifespan', 'Plug and play'],
  'storage': ['Maximize space', 'Custom fit', 'Durable materials', 'Easy access'],
  'default': ['Premium quality', 'Perfect fit', 'Easy installation', 'Great value'],
};

const STORE_INFO: Record<string, { rating: string; shipping: string; returns: string; established: string }> = {
  'Tesery': { rating: '4.7', shipping: 'Free shipping over $49', returns: '30-day returns', established: '2018' },
  'Yeslak': { rating: '4.6', shipping: 'Free shipping over $59', returns: '30-day returns', established: '2019' },
  'Jowua': { rating: '4.8', shipping: 'Free worldwide shipping', returns: '14-day returns', established: '2017' },
  'Hansshow': { rating: '4.5', shipping: 'Free shipping over $99', returns: '30-day returns', established: '2016' },
  'Shop4Tesla': { rating: '4.6', shipping: 'EU warehouse available', returns: '14-day returns', established: '2019' },
  'default': { rating: '4.5', shipping: 'Standard shipping', returns: '30-day returns', established: '2018' },
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

function formatCategory(cat: string) {
  return cat.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function cleanDescription(desc: string): string {
  if (!desc) return '';
  let cleaned = desc.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');
  cleaned = cleaned.replace(/\{[^}]*\}/g, '');
  cleaned = cleaned.replace(/\.[a-zA-Z0-9_-]+/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/[{}();:]/g, '');
  if (cleaned.includes('font-family') || cleaned.includes('margin') || cleaned.includes('padding')) {
    return '';
  }
  return cleaned.slice(0, 500);
}

function getModelNames(models: string[]): string {
  if (!models || models.length === 0) return 'All Tesla Models';
  const filtered = models.filter(m => m !== 'universal');
  if (filtered.length === 0) return 'All Tesla Models';
  return filtered.map(m => MODEL_LABELS[m] || m).join(', ');
}

function generateProductFeatures(title: string, category: string): string[] {
  const titleLower = title.toLowerCase();
  const features: string[] = [];

  // Generic features based on keywords
  if (titleLower.includes('leather') || titleLower.includes('premium')) {
    features.push('Premium materials for luxury feel');
  }
  if (titleLower.includes('waterproof') || titleLower.includes('water')) {
    features.push('Waterproof protection');
  }
  if (titleLower.includes('wireless')) {
    features.push('Convenient wireless design');
  }
  if (titleLower.includes('led') || titleLower.includes('light')) {
    features.push('Energy-efficient LED technology');
  }
  if (titleLower.includes('carbon') || titleLower.includes('fiber')) {
    features.push('Lightweight carbon fiber construction');
  }
  if (titleLower.includes('matte') || titleLower.includes('glossy')) {
    features.push('Premium finish quality');
  }
  if (titleLower.includes('organizer') || titleLower.includes('storage')) {
    features.push('Optimized storage space');
  }

  // Add category-based features
  const categoryFeatures = CATEGORY_BENEFITS[category] || CATEGORY_BENEFITS['default'];
  for (const f of categoryFeatures) {
    if (!features.includes(f) && features.length < 6) {
      features.push(f);
    }
  }

  return features.slice(0, 6);
}

export default function ProductPageClient({
  product,
  similarProducts
}: {
  product: Product;
  similarProducts: Product[];
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'shipping'>('overview');

  const discountInfo = getDiscountInfo(product.url);
  const affiliateUrl = getAffiliateUrl(product.url);
  const cleanedDescription = cleanDescription(product.description || '');
  const modelNames = getModelNames(product.models);
  const features = generateProductFeatures(product.title, product.category);
  const storeInfo = STORE_INFO[product.source] || STORE_INFO['default'];

  const discountedPrice = discountInfo
    ? (product.price * (1 - discountInfo.percent / 100)).toFixed(2)
    : null;

  const savingsAmount = discountInfo
    ? (product.price - parseFloat(discountedPrice!)).toFixed(2)
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <header style={{
        background: '#0a0a0a',
        padding: '14px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid #222'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Tesla<span style={{ color: '#E82127' }}>Compare</span>
          </Link>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Link href="/" style={{ color: '#a3a3a3', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              All Products
            </Link>
            <Link href="/top-10" style={{ color: '#fbbf24', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              🏆 Top 10
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#6b7280' }}>
            <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href={`/?category=${product.category}`} style={{ color: '#6b7280', textDecoration: 'none' }}>
              {formatCategory(product.category)}
            </Link>
            <span>›</span>
            <span style={{ color: '#111' }}>{product.title.slice(0, 50)}...</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: 48 }}>

          {/* Left Column */}
          <div>
            {/* Product Image */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              marginBottom: 24
            }}>
              <div style={{ position: 'relative' }}>
                {product.image ? (
                  <div style={{ aspectRatio: '4/3', background: '#fafafa' }}>
                    <img
                      src={product.image}
                      alt={product.title}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 32 }}
                    />
                  </div>
                ) : (
                  <div style={{
                    aspectRatio: '4/3',
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    fontSize: 16
                  }}>
                    No Image Available
                  </div>
                )}

                {/* Badges */}
                <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
                  {discountInfo && (
                    <div style={{
                      background: '#dc2626',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700
                    }}>
                      {discountInfo.percent}% OFF
                    </div>
                  )}
                  <div style={{
                    background: '#0a0a0a',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600
                  }}>
                    {product.source}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              {/* Tab Headers */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'specs', label: 'Specifications' },
                  { id: 'shipping', label: 'Shipping & Returns' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    style={{
                      flex: 1,
                      padding: '16px 20px',
                      fontSize: 14,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: activeTab === tab.id ? '#fff' : '#f9fafb',
                      color: activeTab === tab.id ? '#111' : '#6b7280',
                      borderBottom: activeTab === tab.id ? '2px solid #E82127' : '2px solid transparent',
                      marginBottom: -1
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{ padding: 24 }}>
                {activeTab === 'overview' && (
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>
                      Product Overview
                    </h2>

                    {cleanedDescription ? (
                      <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, marginBottom: 24 }}>
                        {cleanedDescription}
                      </p>
                    ) : (
                      <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, marginBottom: 24 }}>
                        Upgrade your Tesla with this high-quality {formatCategory(product.category).toLowerCase()} accessory.
                        Designed specifically for {modelNames}, this product offers perfect fitment and premium quality
                        that meets or exceeds OEM standards. Enhance your driving experience with this carefully
                        selected accessory from {product.source}.
                      </p>
                    )}

                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#111' }}>
                      Key Features
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {features.map((feature, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: '#dcfce7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            color: '#16a34a'
                          }}>
                            ✓
                          </div>
                          <span style={{ fontSize: 14, color: '#374151' }}>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>
                      Technical Specifications
                    </h2>
                    <div style={{ display: 'grid', gap: 0 }}>
                      {[
                        { label: 'Category', value: formatCategory(product.category) },
                        { label: 'Compatible Models', value: modelNames },
                        { label: 'Model Years', value: product.models?.filter(m => m !== 'universal').map(m => MODEL_YEARS[m] || 'All Years').join(', ') || 'All Years' },
                        { label: 'Sold By', value: product.source },
                        { label: 'Brand', value: product.vendor || product.source },
                        { label: 'Price', value: `$${product.price.toFixed(2)} USD` },
                        { label: 'SKU', value: `TPC-${product.sourceId?.slice(0, 8) || 'N/A'}` },
                      ].map((spec, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '14px 0',
                            borderBottom: '1px solid #f3f4f6',
                            fontSize: 14
                          }}
                        >
                          <span style={{ color: '#6b7280' }}>{spec.label}</span>
                          <span style={{ color: '#111', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>
                      Shipping & Returns
                    </h2>

                    <div style={{ display: 'grid', gap: 20 }}>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 24
                        }}>
                          🚚
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 4 }}>
                            Shipping Policy
                          </div>
                          <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                            {storeInfo.shipping}. Most orders ship within 1-3 business days.
                            International shipping available to most countries.
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 24
                        }}>
                          ↩️
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 4 }}>
                            Return Policy
                          </div>
                          <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                            {storeInfo.returns} for unused items in original packaging.
                            Contact {product.source} customer service to initiate a return.
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 24
                        }}>
                          🛡️
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 4 }}>
                            Warranty
                          </div>
                          <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                            Products are covered by manufacturer warranty.
                            Contact {product.source} for warranty claims and support.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Purchase Card */}
          <div>
            <div style={{ position: 'sticky', top: 80 }}>
              {/* Main Purchase Card */}
              <div style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                marginBottom: 16
              }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  {/* Model Tags */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                    {product.models?.filter(m => m !== 'universal').slice(0, 3).map(model => (
                      <span
                        key={model}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '4px 10px',
                          background: '#f3f4f6',
                          color: '#374151',
                          borderRadius: 6
                        }}
                      >
                        {MODEL_LABELS[model] || model}
                      </span>
                    ))}
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '4px 10px',
                      background: '#fef3c7',
                      color: '#92400e',
                      borderRadius: 6
                    }}>
                      {formatCategory(product.category)}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#111',
                    lineHeight: 1.3,
                    marginBottom: 8
                  }}>
                    {product.title}
                  </h1>

                  {/* Compatibility */}
                  <p style={{ fontSize: 13, color: '#6b7280' }}>
                    Fits: {modelNames}
                  </p>
                </div>

                {/* Price Section */}
                <div style={{ padding: '20px 24px', background: '#fafafa' }}>
                  {discountInfo ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                        <span style={{ fontSize: 36, fontWeight: 800, color: '#16a34a' }}>
                          ${discountedPrice}
                        </span>
                        <span style={{ fontSize: 18, color: '#9ca3af', textDecoration: 'line-through' }}>
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 14,
                        color: '#16a34a',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <span>🎉</span> You save ${savingsAmount} ({discountInfo.percent}% off)
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#111' }}>
                      ${product.price.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Discount Code */}
                {discountInfo && (
                  <div style={{ padding: '0 24px 24px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      borderRadius: 12,
                      padding: '16px 20px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8
                      }}>
                        <div>
                          <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>
                            Exclusive Discount Code
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                            Copy and apply at checkout
                          </div>
                        </div>
                        <div style={{
                          background: '#fff',
                          padding: '10px 20px',
                          borderRadius: 8,
                          fontFamily: 'monospace',
                          fontSize: 18,
                          fontWeight: 800,
                          color: '#15803d',
                          letterSpacing: '0.1em'
                        }}>
                          {discountInfo.code}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <div style={{ padding: '0 24px 24px' }}>
                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '18px 24px',
                      background: '#E82127',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 14px rgba(232, 33, 39, 0.35)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#c81d22';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(232, 33, 39, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#E82127';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(232, 33, 39, 0.35)';
                    }}
                  >
                    {discountInfo ? (
                      <>
                        Get {discountInfo.percent}% Off Now
                        <span style={{ fontSize: 18 }}>→</span>
                      </>
                    ) : (
                      <>
                        Buy Now at {product.source}
                        <span style={{ fontSize: 18 }}>→</span>
                      </>
                    )}
                  </a>

                  <p style={{
                    fontSize: 12,
                    color: '#9ca3af',
                    textAlign: 'center',
                    marginTop: 12
                  }}>
                    Secure checkout on {product.source}
                  </p>
                </div>
              </div>

              {/* Store Info Card */}
              <div style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                padding: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#374151'
                  }}>
                    {product.source.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>{product.source}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Verified Tesla Accessories Seller</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: '#f9fafb', padding: '12px 14px', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Rating</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>⭐ {storeInfo.rating}/5</div>
                  </div>
                  <div style={{ background: '#f9fafb', padding: '12px 14px', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Since</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{storeInfo.established}</div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: 16,
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                    <span>🚚</span> {storeInfo.shipping.split('.')[0]}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                    <span>↩️</span> {storeInfo.returns}
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 20,
                marginTop: 16,
                padding: '16px 20px',
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>🔒</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Secure</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>✓</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Verified</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>🚚</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Fast Ship</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>💳</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Safe Pay</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {(() => {
          const partnerProducts = similarProducts.filter(p => isAffiliatePartner(p.url));
          if (partnerProducts.length === 0) return null;

          return (
            <section style={{ marginTop: 64 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24
              }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111' }}>
                  You Might Also Like
                </h2>
                <Link href="/" style={{
                  fontSize: 14,
                  color: '#E82127',
                  textDecoration: 'none',
                  fontWeight: 600
                }}>
                  View All →
                </Link>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 20
              }}>
                {partnerProducts.slice(0, 8).map((p, idx) => {
                  const pDiscount = getDiscountInfo(p.url);
                  return (
                    <Link
                      key={idx}
                      href={`/product/${generateSlug(p.title)}`}
                      style={{
                        background: '#fff',
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        {p.image && (
                          <div style={{ aspectRatio: '4/3', background: '#f9fafb', overflow: 'hidden' }}>
                            <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        {pDiscount && (
                          <div style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: '#16a34a',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700
                          }}>
                            {pDiscount.percent}% OFF
                          </div>
                        )}
                      </div>
                      <div style={{ padding: 16 }}>
                        <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{p.source}</p>
                        <p style={{
                          fontSize: 14,
                          fontWeight: 600,
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
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>
                            ${p.price.toFixed(0)}
                          </span>
                          {pDiscount && (
                            <span style={{
                              fontSize: 11,
                              color: '#16a34a',
                              fontWeight: 600,
                              background: '#dcfce7',
                              padding: '3px 8px',
                              borderRadius: 4
                            }}>
                              Code: {pDiscount.code}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })()}

        {/* FAQ Section */}
        <section style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 24 }}>
            Frequently Asked Questions
          </h2>
          <div style={{
            display: 'grid',
            gap: 16
          }}>
            {[
              {
                q: `Will this fit my Tesla ${modelNames.split(',')[0]}?`,
                a: `Yes! This product is specifically designed for ${modelNames}. It offers perfect fitment and has been tested for compatibility with your vehicle.`
              },
              {
                q: 'How do I use the discount code?',
                a: discountInfo
                  ? `Simply copy the code "${discountInfo.code}" and paste it at checkout on ${product.source}. The ${discountInfo.percent}% discount will be applied automatically.`
                  : `Click the "Buy Now" button to visit ${product.source} and check for any available promotions at checkout.`
              },
              {
                q: 'What is the return policy?',
                a: `${product.source} offers ${storeInfo.returns} for unused items in their original packaging. Contact their customer service team to initiate a return.`
              },
              {
                q: 'How long does shipping take?',
                a: `${storeInfo.shipping}. Most orders are processed within 1-3 business days. Delivery times vary by location, typically 5-10 business days for standard shipping.`
              },
            ].map((faq, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  padding: 20
                }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 8 }}>
                  {faq.q}
                </h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#0a0a0a',
        color: '#9ca3af',
        padding: '48px 24px',
        marginTop: 64
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
                Tesla<span style={{ color: '#E82127' }}>Compare</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                Find the best prices on Tesla accessories from verified retailers with exclusive discount codes.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Shop by Model</div>
              {['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'].map(m => (
                <Link key={m} href={`/?model=${m.toLowerCase().replace(' ', '-')}`} style={{ display: 'block', fontSize: 13, color: '#9ca3af', textDecoration: 'none', marginBottom: 8 }}>
                  {m} Accessories
                </Link>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Categories</div>
              {['Floor Mats', 'Screen Protectors', 'Charging', 'Interior', 'Exterior'].map(c => (
                <Link key={c} href={`/?category=${c.toLowerCase().replace(' ', '-')}`} style={{ display: 'block', fontSize: 13, color: '#9ca3af', textDecoration: 'none', marginBottom: 8 }}>
                  {c}
                </Link>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Our Partners</div>
              {['Tesery', 'Yeslak', 'Jowua', 'Hansshow'].map(s => (
                <span key={s} style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #333', paddingTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 12 }}>
              © 2025 TeslaCompare. Not affiliated with Tesla, Inc. All prices subject to change.
            </p>
          </div>
        </div>
      </footer>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 1024px) {
          main > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          section > div:last-child {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          section > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
