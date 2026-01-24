// Centralized TypeScript types

export interface Product {
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

export interface ProductMatch {
  matchKey: string;
  name?: string;
  category: string;
  models: string[];
  brand?: string;
  matchType?: string;
  confidence?: string;
  lowestPrice: number;
  highestPrice: number;
  savings: number;
  savingsPercent: number;
  products: Product[];
}

export interface PriceHistoryEntry {
  date: string;
  price: number;
  source: string;
}

export interface FilterState {
  searchQuery: string;
  selectedModels: string[];
  selectedCategories: string[];
  selectedSources: string[];
  priceMin: number;
  priceMax: number;
  onlyDiscounted: boolean;
}

export type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'discount-desc' | 'newest';
export type ViewMode = 'products' | 'comparisons';

export interface TopList {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  models?: string[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    images?: { url: string; width?: number; height?: number; alt?: string }[];
    type?: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  products: T[];
  meta: PaginationMeta;
}
