'use client';

import useSWR, { preload } from 'swr';
import { useState, useEffect, useMemo } from 'react';
import { Product, PaginatedResponse, PaginationMeta, SortOption } from '../types';

interface UseProductsParams {
  page: number;
  limit?: number;
  models?: string[];
  categories?: string[];
  sources?: string[];
  priceMin?: number;
  priceMax?: number;
  search?: string;
  sort?: SortOption;
  onlyDiscounted?: boolean;
}

interface UseProductsResult {
  products: Product[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
}

const fetcher = async (url: string): Promise<PaginatedResponse<Product>> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
};

function buildQueryString(params: UseProductsParams): string {
  const searchParams = new URLSearchParams();

  searchParams.set('page', params.page.toString());

  if (params.limit) {
    searchParams.set('limit', params.limit.toString());
  }

  if (params.models && params.models.length > 0) {
    searchParams.set('models', params.models.join(','));
  }

  if (params.categories && params.categories.length > 0) {
    searchParams.set('categories', params.categories.join(','));
  }

  if (params.sources && params.sources.length > 0) {
    searchParams.set('sources', params.sources.join(','));
  }

  if (params.priceMin !== undefined && params.priceMin > 0) {
    searchParams.set('priceMin', params.priceMin.toString());
  }

  if (params.priceMax !== undefined && params.priceMax < 5000) {
    searchParams.set('priceMax', params.priceMax.toString());
  }

  if (params.search) {
    searchParams.set('search', params.search);
  }

  if (params.sort) {
    searchParams.set('sort', params.sort);
  }

  if (params.onlyDiscounted) {
    searchParams.set('onlyDiscounted', 'true');
  }

  return searchParams.toString();
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useProducts(
  params: UseProductsParams,
  fallbackData?: PaginatedResponse<Product>
): UseProductsResult {
  // Debounce search input to avoid too many API calls
  const debouncedSearch = useDebounce(params.search || '', 300);

  const queryString = useMemo(() => {
    return buildQueryString({
      ...params,
      search: debouncedSearch,
    });
  }, [params, debouncedSearch]);

  const { data, error, isLoading, isValidating } = useSWR<PaginatedResponse<Product>>(
    `/api/products?${queryString}`,
    fetcher,
    {
      fallbackData,
      keepPreviousData: true,
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  );

  // Prefetch next page for instant pagination
  useEffect(() => {
    if (data?.meta?.hasMore) {
      const nextPageQuery = buildQueryString({
        ...params,
        page: params.page + 1,
        search: debouncedSearch,
      });
      preload(`/api/products?${nextPageQuery}`, fetcher);
    }
  }, [data?.meta?.hasMore, params, debouncedSearch]);

  return {
    products: data?.products || [],
    meta: data?.meta || null,
    isLoading,
    isValidating,
    error: error || null,
  };
}
