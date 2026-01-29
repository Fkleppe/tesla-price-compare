'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { MODEL_LABELS } from '@/lib/constants';

const CATEGORY_BENEFITS: Record<string, string[]> = {
  'floor-mats': ['Custom laser-measured fit', 'Easy to clean', 'All-weather protection', 'Protects original carpet', 'Non-slip backing', 'Raised edges contain spills'],
  'screen-protector': ['Anti-glare coating', 'Scratch resistant', 'Bubble-free install', 'Fingerprint resistant', '9H hardness rating', 'Preserves touch sensitivity'],
  'screen-protectors': ['Anti-glare coating', 'Scratch resistant', 'Bubble-free install', 'Fingerprint resistant', '9H hardness rating', 'Preserves touch sensitivity'],
  'center-console': ['Precise fit design', 'Scratch protection', 'Durable materials', 'Tool-free install', 'OEM-matching finish', 'Heat resistant'],
  'charging': ['Fast charging capable', 'Safety certified', 'Weather resistant', 'J1772 compatible', 'LED indicators', 'Overheat protection'],
  'charger': ['Fast charging capable', 'Safety certified', 'Weather resistant', 'J1772 compatible', 'LED indicators', 'Overheat protection'],
  'default': ['Durable materials', 'Custom fit', 'Easy install', 'Solid construction', 'Tesla-specific design', 'Good finish'],
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'floor-mats': 'TPE (thermoplastic elastomer) floor mats have become the preferred choice for Tesla owners over traditional rubber. TPE is odorless, non-toxic, and handles temperatures from -58°F to 176°F without cracking or warping.',
  'screen-protector': 'Tesla\'s touchscreen controls almost everything in the car, so scratches are a real annoyance. Tempered glass protectors with 9H hardness resist scratches from rings, keys, and fingernails.',
  'screen-protectors': 'Tesla\'s touchscreen controls almost everything in the car, so scratches are a real annoyance. Tempered glass protectors with 9H hardness resist scratches from rings, keys, and fingernails.',
  'center-console': 'The center console gets touched constantly, and the piano black finish on older Teslas shows every fingerprint and scratch. Protective wraps and covers prevent this.',
  'charging': 'Most Tesla owners charge at home overnight. A Level 2 charger (240V) adds 30-44 miles of range per hour, enough to fully charge overnight.',
  'default': 'Tesla accessories protect the car and add functionality. Aftermarket products designed specifically for Tesla have better fitment than universal accessories.',
};

const INSTALLATION_GUIDES: Record<string, { steps: string[]; time: string; difficulty: string; tools: string }> = {
  'floor-mats': {
    steps: [
      'Remove existing floor mats or liners from your Tesla',
      'Vacuum the carpet thoroughly to remove dirt and debris',
      'For driver mat: align with the dead pedal and hook onto retention clips',
      'Press firmly along edges to ensure secure fit around seat tracks',
      'Verify mat does not interfere with accelerator or brake pedal',
    ],
    time: '5-10 minutes',
    difficulty: 'Easy',
    tools: 'None required'
  },
  'screen-protector': {
    steps: [
      'Park in a dust-free environment (garage recommended)',
      'Clean screen with included alcohol wipe, then dry with microfiber cloth',
      'Use dust removal stickers to pick up any remaining particles',
      'Align top edge with screen bezel and slowly lower protector',
      'Use squeegee card to push out air bubbles from center outward',
    ],
    time: '10-20 minutes',
    difficulty: 'Medium',
    tools: 'Included kit (alcohol wipe, microfiber cloth, squeegee)'
  },
  'screen-protectors': {
    steps: [
      'Park in a dust-free environment (garage recommended)',
      'Clean screen with included alcohol wipe, then dry with microfiber cloth',
      'Use dust removal stickers to pick up any remaining particles',
      'Align top edge with screen bezel and slowly lower protector',
      'Use squeegee card to push out air bubbles from center outward',
    ],
    time: '10-20 minutes',
    difficulty: 'Medium',
    tools: 'Included kit (alcohol wipe, microfiber cloth, squeegee)'
  },
  'default': {
    steps: [
      'Read the included installation instructions carefully',
      'Clean the installation area if using adhesive',
      'Test fit the product before final installation',
      'Follow manufacturer guidelines for best results',
      'Allow adhesive to cure if applicable',
    ],
    time: '10-30 minutes',
    difficulty: 'Easy to Medium',
    tools: 'Varies by product'
  }
};

const STORE_INFO: Record<string, { shipping: string; returns: string }> = {
  'Tesery': { shipping: 'Free shipping over $49', returns: '30-day returns' },
  'Tesmanian': { shipping: 'Free shipping over $100', returns: '30-day returns' },
  'Yeslak': { shipping: 'Free shipping over $59', returns: '30-day returns' },
  'Jowua': { shipping: 'Free worldwide shipping', returns: '14-day returns' },
  'Hansshow': { shipping: 'Free shipping over $99', returns: '30-day returns' },
  'default': { shipping: 'Standard shipping rates apply', returns: '30-day returns' },
};

function formatCategory(cat: string) {
  return cat.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
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

  if (titleLower.includes('leather')) features.push('Leather');
  if (titleLower.includes('waterproof') || titleLower.includes('water')) features.push('Waterproof');
  if (titleLower.includes('wireless')) features.push('Wireless');
  if (titleLower.includes('led') || titleLower.includes('light')) features.push('LED');
  if (titleLower.includes('carbon') || titleLower.includes('fiber')) features.push('Carbon fiber');
  if (titleLower.includes('matte')) features.push('Matte finish');

  const categoryFeatures = CATEGORY_BENEFITS[category] || CATEGORY_BENEFITS['default'];
  for (const f of categoryFeatures) {
    if (!features.includes(f) && features.length < 6) {
      features.push(f);
    }
  }

  return features.slice(0, 6);
}

export default function ProductPageInteractive({
  product,
}: {
  product: Product;
  similarProducts: Product[];
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'shipping'>('overview');

  const features = generateProductFeatures(product.title, product.category);
  const storeInfo = STORE_INFO[product.source] || STORE_INFO['default'];
  const guide = INSTALLATION_GUIDES[product.category] || INSTALLATION_GUIDES['default'];

  return (
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
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#111' }}>
              About This Product
            </h2>
            <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, marginBottom: 20 }}>
              {CATEGORY_DESCRIPTIONS[product.category] || CATEGORY_DESCRIPTIONS['default']}
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>
              Key Features
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
              {features.map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    color: '#16a34a',
                    flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{feature}</span>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>
              Installation Guide
            </h3>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ background: '#f0fdf4', padding: '10px 16px', borderRadius: 8 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Time</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#16a34a' }}>{guide.time}</div>
              </div>
              <div style={{ background: '#fef3c7', padding: '10px 16px', borderRadius: 8 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Difficulty</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>{guide.difficulty}</div>
              </div>
              <div style={{ background: '#f3f4f6', padding: '10px 16px', borderRadius: 8 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Tools</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{guide.tools}</div>
              </div>
            </div>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {guide.steps.map((step, i) => (
                <li key={i} style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.8, marginBottom: 8 }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {activeTab === 'specs' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#111' }}>
              Product Specifications
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ width: 160, fontSize: 14, color: '#6b7280' }}>Compatible Models</span>
                <span style={{ fontSize: 14, color: '#111', fontWeight: 500 }}>
                  {getModelNames(product.models)}
                </span>
              </div>
              <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ width: 160, fontSize: 14, color: '#6b7280' }}>Category</span>
                <span style={{ fontSize: 14, color: '#111', fontWeight: 500 }}>
                  {formatCategory(product.category)}
                </span>
              </div>
              <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ width: 160, fontSize: 14, color: '#6b7280' }}>Brand / Vendor</span>
                <span style={{ fontSize: 14, color: '#111', fontWeight: 500 }}>
                  {product.vendor || product.source}
                </span>
              </div>
              <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ width: 160, fontSize: 14, color: '#6b7280' }}>Sold By</span>
                <span style={{ fontSize: 14, color: '#111', fontWeight: 500 }}>
                  {product.source}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#111' }}>
              Shipping & Returns
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#f9fafb', padding: 20, borderRadius: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#111' }}>
                  Shipping
                </h3>
                <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
                  {storeInfo.shipping}. Orders typically ship within 1-3 business days.
                  Delivery time depends on your location but is usually 5-10 business days.
                </p>
              </div>
              <div style={{ background: '#f9fafb', padding: 20, borderRadius: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#111' }}>
                  Returns
                </h3>
                <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
                  {storeInfo.returns}. Items must be in original, unused condition with all packaging.
                  Contact {product.source} customer service to initiate a return.
                </p>
              </div>
              <div style={{ background: '#f9fafb', padding: 20, borderRadius: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#111' }}>
                  Warranty
                </h3>
                <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
                  This product is covered by {product.source}&apos;s standard manufacturer warranty
                  against defects in materials and workmanship.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
