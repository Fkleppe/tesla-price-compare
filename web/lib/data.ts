// Server-side data fetching utilities
// These functions read directly from JSON files and should only be used in Server Components

import { Product, ProductMatch } from './types';
import { isAffiliatePartner } from './affiliate';

// Import JSON data directly for server-side use
import allProductsData from '../data/latest.json';
import matchesData from '../data/ai-matches.json';

export function getProducts(): Product[] {
  const products = (allProductsData as Product[]).filter(
    (p) => p.price >= 10 && isAffiliatePartner(p.url)
  );
  return products;
}

export function getMatches(): ProductMatch[] {
  return matchesData as ProductMatch[];
}

export interface ProductStats {
  totalProducts: number;
  totalStores: number;
  totalMatches: number;
  discountedCount: number;
  maxPrice: number;
  models: string[];
  categories: string[];
  sources: string[];
}

export function getProductStats(products: Product[], matches: ProductMatch[]): ProductStats {
  const sources = new Set<string>();
  const models = new Set<string>();
  const categories = new Set<string>();
  let maxPrice = 0;

  products.forEach((p) => {
    if (p.source) sources.add(p.source);
    p.models?.forEach((m) => models.add(m));
    if (p.category && p.category !== 'other') categories.add(p.category);
    if (p.price > maxPrice) maxPrice = p.price;
  });

  const modelOrder = ['model-3', 'highland', 'model-y', 'juniper', 'model-s', 'model-x', 'cybertruck', 'universal'];

  // Filter matches to only include affiliate partners
  const filteredMatches = matches
    .map((m) => ({
      ...m,
      products: m.products.filter((p) => isAffiliatePartner(p.url)),
    }))
    .filter((m) => m.products.length >= 2);

  return {
    totalProducts: products.length,
    totalStores: sources.size,
    totalMatches: filteredMatches.length,
    discountedCount: 0, // Will be calculated client-side since it depends on affiliate logic
    maxPrice: Math.ceil(maxPrice / 100) * 100,
    models: modelOrder.filter((m) => models.has(m)),
    categories: Array.from(categories).sort(),
    sources: Array.from(sources).sort(),
  };
}

// Get a subset of products for initial SSR (first page)
export function getInitialProducts(products: Product[], limit = 48): Product[] {
  return products.slice(0, limit);
}

// Get top matches for SSR
export function getTopMatches(matches: ProductMatch[], limit = 12): ProductMatch[] {
  const filtered = matches
    .map((m) => {
      const affiliateProducts = m.products.filter((p) => isAffiliatePartner(p.url));
      if (affiliateProducts.length < 2) return null;

      const prices = affiliateProducts.map((p) => p.price);
      const lowestPrice = Math.min(...prices);
      const highestPrice = Math.max(...prices);

      return {
        ...m,
        products: affiliateProducts,
        lowestPrice,
        highestPrice,
        savings: highestPrice - lowestPrice,
        savingsPercent: Math.round(((highestPrice - lowestPrice) / highestPrice) * 100),
      };
    })
    .filter((m): m is ProductMatch => m !== null)
    .sort((a, b) => b.savingsPercent - a.savingsPercent);

  return filtered.slice(0, limit);
}
