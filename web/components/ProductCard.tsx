'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { getDiscountInfo, getAffiliateUrl } from '@/lib/affiliate';
import { generateSlug, MODEL_LABELS, formatPrice } from '@/lib/constants';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const discount = getDiscountInfo(product.url);
  const slug = generateSlug(product.title);
  const affiliateUrl = getAffiliateUrl(product.url);
  const discountedPrice = discount
    ? product.price * (1 - discount.percent / 100)
    : product.price;

  return (
    <article className="group bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300 flex flex-col">
      <Link href={`/product/${slug}`} className="flex flex-col flex-1">
        {/* Product Image */}
        <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority={priority}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              No Image
            </div>
          )}
          {discount && (
            <span className="absolute top-2 left-2 px-2.5 py-1 bg-green-600 text-white text-xs font-bold rounded-md shadow-md">
              {discount.percent}% OFF
            </span>
          )}
        </div>

        {/* Product Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Meta */}
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-gray-600 font-medium">{product.source}</span>
            {product.models?.filter(m => m !== 'universal').slice(0, 1).map(m => (
              <span key={m} className="text-gray-400">
                {MODEL_LABELS[m]?.split(' ').pop() || m}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug min-h-[40px] group-hover:text-red-600 transition-colors">
            {product.title}
          </h3>

          {/* Price */}
          <div className="mt-auto">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {discount && (
                <span className="text-sm font-semibold text-green-600">
                  {formatPrice(discountedPrice)} with code
                </span>
              )}
            </div>

            {/* Discount Code */}
            {discount && (
              <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 border-dashed rounded-lg flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-bold text-green-700 tracking-wide">
                  {discount.code}
                </span>
                <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded">
                  -{discount.percent}%
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Visit Button */}
      <div className="p-4 pt-0">
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold text-center rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
        >
          Visit {product.source} →
        </a>
      </div>
    </article>
  );
}
