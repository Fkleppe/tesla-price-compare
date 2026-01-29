import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { TESLA_MODELS, CATEGORIES, SITE_NAME, SITE_URL, generateSlug } from '@/lib/constants';
import { promises as fs } from 'fs';
import path from 'path';
import { isAffiliatePartner, getDiscountInfo } from '@/lib/affiliate';
import { Product } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string; category: string }>;
}

async function getProducts(): Promise<Product[]> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'latest.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Generate all valid model + category combinations
export async function generateStaticParams() {
  const products = await getProducts();
  const affiliateProducts = products.filter(p => isAffiliatePartner(p.url));

  const combinations: { slug: string; category: string }[] = [];

  for (const model of TESLA_MODELS.filter(m => m.id !== 'universal')) {
    for (const category of CATEGORIES) {
      // Only create page if there are products for this combination
      const hasProducts = affiliateProducts.some(
        p => p.models?.includes(model.id) && p.category === category.id
      );
      if (hasProducts) {
        combinations.push({ slug: model.id, category: category.id });
      }
    }
  }

  return combinations;
}

// Model display info
const MODEL_INFO: Record<string, { name: string; year: string }> = {
  'model-3': { name: 'Model 3', year: '2017-2023' },
  'highland': { name: 'Model 3 Highland', year: '2024+' },
  'model-y': { name: 'Model Y', year: '2020-2024' },
  'juniper': { name: 'Model Y Juniper', year: '2025+' },
  'model-s': { name: 'Model S', year: '2012+' },
  'model-x': { name: 'Model X', year: '2015+' },
  'cybertruck': { name: 'Cybertruck', year: '2024+' },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: model, category } = await params;
  const modelData = TESLA_MODELS.find(m => m.id === model);
  const categoryData = CATEGORIES.find(c => c.id === category);

  if (!modelData || !categoryData) {
    return { title: 'Not Found' };
  }

  const modelInfo = MODEL_INFO[model] || { name: modelData.name, year: '2020+' };
  const title = `Best ${categoryData.name} for Tesla ${modelInfo.name} (${modelInfo.year})`;
  const description = `Compare ${categoryData.name.toLowerCase()} prices for Tesla ${modelInfo.name}. Find the best ${categoryData.name.toLowerCase()} with exclusive discount codes. Save up to 20% on ${modelInfo.name} accessories.`;

  return {
    title,
    description,
    keywords: [
      `Tesla ${modelInfo.name} ${categoryData.name.toLowerCase()}`,
      `best ${categoryData.name.toLowerCase()} for ${modelInfo.name}`,
      `${modelInfo.name} ${categoryData.name.toLowerCase()} ${modelInfo.year.split('-')[0]}`,
      `Tesla ${model} accessories`,
      `${categoryData.name} comparison`,
      'Tesla discount codes',
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/model/${model}/${category}`,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/model/${model}/${category}`,
    },
  };
}

// Generate breadcrumb JSON-LD
function generateBreadcrumbJsonLd(
  model: { id: string; name: string },
  category: { id: string; name: string }
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Tesla Models', item: `${SITE_URL}/model` },
      { '@type': 'ListItem', position: 3, name: `${model.name}`, item: `${SITE_URL}/model/${model.id}` },
      { '@type': 'ListItem', position: 4, name: `${category.name}`, item: `${SITE_URL}/model/${model.id}/${category.id}` },
    ],
  };
}

// Generate FAQ JSON-LD
function generateFAQJsonLd(
  model: { id: string; name: string },
  category: { id: string; name: string },
  productCount: number,
  lowestPrice: number,
  highestPrice: number
) {
  const modelInfo = MODEL_INFO[model.id] || { name: model.name, year: '2020+' };

  const faqs = [
    {
      question: `What are the best ${category.name.toLowerCase()} for Tesla ${model.name}?`,
      answer: `We compare ${productCount}+ ${category.name.toLowerCase()} specifically designed for Tesla ${model.name} (${modelInfo.year}). Prices range from $${lowestPrice} to $${highestPrice}. Popular brands include Tesmanian, Tesery, and 3D MAXpider.`
    },
    {
      question: `Do ${category.name.toLowerCase()} fit all Tesla ${model.name} years?`,
      answer: `${category.name} on this page are specifically designed for Tesla ${model.name} (${modelInfo.year}). Always verify compatibility with your specific production date before purchasing.`
    },
    {
      question: `Where can I buy ${category.name.toLowerCase()} for my Tesla ${model.name}?`,
      answer: `We compare prices from trusted Tesla accessory retailers. Many products include exclusive discount codes that save you 5-20% off the regular price.`
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

// Generate ItemList JSON-LD
function generateItemListJsonLd(
  products: Product[],
  model: { name: string },
  category: { name: string }
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} for Tesla ${model.name}`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 20).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        image: product.image,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        url: `${SITE_URL}/product/${generateSlug(product.title)}`,
      },
    })),
  };
}

export default async function ModelCategoryPage({ params }: Props) {
  const { slug: model, category } = await params;
  const modelData = TESLA_MODELS.find(m => m.id === model);
  const categoryData = CATEGORIES.find(c => c.id === category);

  if (!modelData || !categoryData) {
    notFound();
  }

  const products = await getProducts();
  const modelInfo = MODEL_INFO[model] || { name: modelData.name, year: '2020+' };

  // Filter products for this model + category combination
  const filteredProducts = products.filter(
    p => p.models?.includes(model) && p.category === category && isAffiliatePartner(p.url)
  );

  if (filteredProducts.length === 0) {
    notFound();
  }

  // Calculate stats
  const productCount = filteredProducts.length;
  const prices = filteredProducts.map(p => p.price);
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);
  const discountedCount = filteredProducts.filter(p => getDiscountInfo(p.url) !== null).length;

  const partnerProducts = products.filter(p => isAffiliatePartner(p.url));
  const totalStores = new Set(partnerProducts.map(p => p.source)).size;

  // Sort by price ascending
  const sortedProducts = [...filteredProducts].sort((a, b) => a.price - b.price);

  // Related categories for this model
  const relatedCategories = CATEGORIES.filter(c =>
    c.id !== category &&
    products.some(p => p.models?.includes(model) && p.category === c.id && isAffiliatePartner(p.url))
  ).slice(0, 6);

  // Related models for this category
  const relatedModels = TESLA_MODELS.filter(m =>
    m.id !== model &&
    m.id !== 'universal' &&
    products.some(p => p.models?.includes(m.id) && p.category === category && isAffiliatePartner(p.url))
  ).slice(0, 6);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(modelData, categoryData);
  const faqJsonLd = generateFAQJsonLd(modelData, categoryData, productCount, lowestPrice, highestPrice);
  const itemListJsonLd = generateItemListJsonLd(sortedProducts, modelData, categoryData);

  const stats = {
    totalProducts: partnerProducts.length,
    totalStores,
    discountedCount,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <Header stats={stats} />

        <main style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px' }}>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Tesla Models', href: '/model' },
              { label: modelData.name, href: `/model/${model}` },
              { label: categoryData.name },
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
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: 'rgba(255,255,255,0.8)' }}>
              Tesla {modelData.name} ({modelInfo.year})
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
              {categoryData.name}
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', maxWidth: 600, lineHeight: 1.6 }}>
              {categoryData.description} specifically designed for Tesla {modelData.name}.
              Compare prices and find the best deals.
            </p>
            <div style={{ display: 'flex', gap: 24, marginTop: 24, flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{productCount}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Products</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>${lowestPrice}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Starting From</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{discountedCount}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>On Sale</div>
              </div>
            </div>
          </section>

          {/* Quick Links - Other categories for this model */}
          {relatedCategories.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', marginBottom: 12 }}>
                Other {modelData.name} Accessories:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {relatedCategories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/model/${model}/${cat.id}`}
                    style={{
                      padding: '8px 16px',
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#374151',
                      textDecoration: 'none',
                    }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Quick Links - Other models for this category */}
          {relatedModels.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', marginBottom: 12 }}>
                {categoryData.name} for Other Models:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {relatedModels.map(m => (
                  <Link
                    key={m.id}
                    href={`/model/${m.id}/${category}`}
                    style={{
                      padding: '8px 16px',
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#374151',
                      textDecoration: 'none',
                    }}
                  >
                    {m.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Product Grid */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#111' }}>
              All {categoryData.name} for {modelData.name} ({productCount} products)
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16
            }}>
              {sortedProducts.map((product, idx) => {
                const discount = getDiscountInfo(product.url);
                const discountedPrice = discount
                  ? (product.price * (1 - discount.percent / 100)).toFixed(0)
                  : null;

                return (
                  <Link
                    key={idx}
                    href={`/product/${generateSlug(product.title)}`}
                    style={{
                      background: '#fff',
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    {product.image && (
                      <div style={{ aspectRatio: '4/3', background: '#fafafa', position: 'relative' }}>
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          priority={idx < 4}
                          style={{ objectFit: 'cover' }}
                        />
                        {discount && (
                          <div style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            background: '#16a34a',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700
                          }}>
                            {discount.percent}% OFF
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ padding: 14 }}>
                      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
                        {product.source}
                      </div>
                      <h3 style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#111',
                        marginBottom: 8,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {product.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        {discountedPrice ? (
                          <>
                            <span style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>
                              ${discountedPrice}
                            </span>
                            <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>
                              ${product.price.toFixed(0)}
                            </span>
                          </>
                        ) : (
                          <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
                            ${product.price.toFixed(0)}
                          </span>
                        )}
                      </div>
                      {discount && (
                        <div style={{
                          marginTop: 8,
                          fontSize: 11,
                          color: '#16a34a',
                          fontWeight: 500
                        }}>
                          Use code: {discount.code}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* SEO Content Section */}
          <section style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            marginBottom: 48,
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#111' }}>
              Buying {categoryData.name} for Your Tesla {modelData.name}
            </h2>
            <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, marginBottom: 16 }}>
              When shopping for {categoryData.name.toLowerCase()} for your Tesla {modelData.name} ({modelInfo.year}),
              it&apos;s important to ensure compatibility with your specific model year.
              We&apos;ve curated {productCount} products from trusted retailers, with prices ranging
              from ${lowestPrice} to ${highestPrice}.
            </p>
            <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, marginBottom: 16 }}>
              Many products on this page include exclusive discount codes that can save you 5-20% off
              the regular price. Look for the green &quot;% OFF&quot; badge and discount code on each product card.
            </p>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#111' }}>
              Why Buy {modelData.name}-Specific {categoryData.name}?
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, marginBottom: 16 }}>
              <li style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
                Custom-fit design ensures perfect coverage for {modelData.name}
              </li>
              <li style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
                Designed for {modelInfo.year} model year specifications
              </li>
              <li style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
                OEM-quality materials from trusted brands
              </li>
              <li style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
                Easy installation with no modifications needed
              </li>
            </ul>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
