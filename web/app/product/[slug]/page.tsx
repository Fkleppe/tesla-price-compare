import { Metadata } from 'next';
import fs from 'fs/promises';
import path from 'path';
import ProductPageClient from './ProductPageClient';
import { isAffiliatePartner } from '../../../lib/affiliate';

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

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

// Get all products (filtered: price >= $10, affiliate partners only)
async function getProducts(): Promise<Product[]> {
  try {
    const dataPath = path.join(process.cwd(), '..', 'data', 'latest.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const allProducts: Product[] = JSON.parse(data);
    return allProducts.filter(p => p.price >= 10 && isAffiliatePartner(p.url));
  } catch {
    return [];
  }
}

// Find product by slug
async function getProductBySlug(slug: string): Promise<{ product: Product; similarProducts: Product[] } | null> {
  const products = await getProducts();

  const product = products.find(p => generateSlug(p.title) === slug);
  if (!product) return null;

  // Find similar products (same category and model)
  const similarProducts = products
    .filter(p =>
      p.title !== product.title &&
      (p.category === product.category ||
       p.models?.some(m => product.models?.includes(m)))
    )
    .slice(0, 12);

  return { product, similarProducts };
}

// Generate static params for all products
export async function generateStaticParams() {
  const products = await getProducts();
  const slugs = new Set<string>();

  return products
    .filter(p => {
      const slug = generateSlug(p.title);
      if (slugs.has(slug)) return false;
      slugs.add(slug);
      return true;
    })
    .map(product => ({
      slug: generateSlug(product.title),
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result) {
    return {
      title: 'Product Not Found | Tesla Price Compare',
      description: 'The product you are looking for could not be found.',
    };
  }

  const { product } = result;
  const modelText = product.models?.filter(m => m !== 'universal').join(', ') || '';

  return {
    title: `${product.title} | Best Price $${product.price} | Tesla Price Compare`,
    description: `Buy ${product.title} for your Tesla ${modelText}. Compare prices from ${product.source} and other retailers. Best price: $${product.price}. Free shipping available.`,
    keywords: [
      product.title,
      'Tesla accessories',
      'Tesla ' + product.category,
      ...product.models || [],
      product.source,
      'Tesla parts',
      'EV accessories',
    ].join(', '),
    openGraph: {
      title: product.title,
      description: `Best price: $${product.price} at ${product.source}`,
      images: product.image ? [{ url: product.image, width: 800, height: 600 }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: `Best price: $${product.price} at ${product.source}`,
      images: product.image ? [product.image] : [],
    },
    alternates: {
      canonical: `/product/${slug}`,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Product Not Found</h1>
          <p style={{ color: '#737373' }}>The product you are looking for could not be found.</p>
          <a href="/" style={{ color: '#E82127', marginTop: 16, display: 'inline-block' }}>
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return <ProductPageClient product={result.product} similarProducts={result.similarProducts} />;
}
