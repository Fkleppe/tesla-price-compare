import { NextRequest, NextResponse } from 'next/server';
import { isAffiliatePartner, getDiscountInfo } from '../../../lib/affiliate';
import { dataCache } from '../../../lib/cache';
import { Product, PaginatedResponse, SortOption } from '../../../lib/types';
import fs from 'fs/promises';
import path from 'path';

const DEFAULT_LIMIT = 48;
const MAX_LIMIT = 100;

function parseCommaSeparated(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

function parseBoolean(value: string | null): boolean {
  return value === 'true' || value === '1';
}

function parseNumber(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = Math.max(1, parseNumber(searchParams.get('page'), 1));
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseNumber(searchParams.get('limit'), DEFAULT_LIMIT)));
    const models = parseCommaSeparated(searchParams.get('models'));
    const categories = parseCommaSeparated(searchParams.get('categories'));
    const sources = parseCommaSeparated(searchParams.get('sources'));
    const priceMin = parseNumber(searchParams.get('priceMin'), 0);
    const priceMax = parseNumber(searchParams.get('priceMax'), Infinity);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const sort = (searchParams.get('sort') || 'price-asc') as SortOption;
    const onlyDiscounted = parseBoolean(searchParams.get('onlyDiscounted'));

    const CACHE_KEY = 'all-filtered-products';

    // Try to get from cache first
    let products = dataCache.get<Product[]>(CACHE_KEY);

    if (!products) {
      // Load from file if not in cache
      const dataPath = path.join(process.cwd(), 'data', 'latest.json');
      const fileContent = await fs.readFile(dataPath, 'utf-8');
      const allProducts = JSON.parse(fileContent) as Product[];

      // Base filter: products >= $10 and from affiliate partners
      products = allProducts.filter((p) =>
        p.price >= 10 && isAffiliatePartner(p.url)
      );

      // Store in cache
      dataCache.set(CACHE_KEY, products);
    }

    // Apply filters
    let filtered = products;

    if (models.length > 0) {
      filtered = filtered.filter(p => p.models?.some(m => models.includes(m)));
    }

    if (categories.length > 0) {
      filtered = filtered.filter(p => categories.includes(p.category));
    }

    if (sources.length > 0) {
      filtered = filtered.filter(p => sources.includes(p.source));
    }

    if (priceMin > 0 || priceMax < Infinity) {
      filtered = filtered.filter(p => p.price >= priceMin && p.price <= priceMax);
    }

    if (onlyDiscounted) {
      filtered = filtered.filter(p => getDiscountInfo(p.url) !== null);
    }

    if (search) {
      filtered = filtered.filter(p => p.title?.toLowerCase().includes(search));
    }

    // Apply sorting
    switch (sort) {
      case 'price-asc':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered = [...filtered].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'discount-desc':
        filtered = [...filtered].sort((a, b) => {
          const discountA = getDiscountInfo(a.url)?.percent || 0;
          const discountB = getDiscountInfo(b.url)?.percent || 0;
          return discountB - discountA;
        });
        break;
    }

    // Calculate pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedProducts = filtered.slice(startIndex, startIndex + limit);

    const response: PaginatedResponse<Product> = {
      products: paginatedProducts,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({
      products: [],
      meta: {
        total: 0,
        page: 1,
        limit: DEFAULT_LIMIT,
        totalPages: 0,
        hasMore: false,
      },
    });
  }
}
