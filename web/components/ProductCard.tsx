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
    <div className="product-card">
      <Link href={`/product/${slug}`} className="product-link">
        <div className="product-image-container">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="product-image"
              priority={priority}
            />
          ) : (
            <div className="product-image-placeholder">No Image</div>
          )}
          {discount && (
            <span className="discount-badge">{discount.percent}% OFF</span>
          )}
        </div>

        <div className="product-content">
          <div className="product-meta">
            <span className="product-source">{product.source}</span>
            {product.models?.filter(m => m !== 'universal').slice(0, 1).map(m => (
              <span key={m} className="product-model">{MODEL_LABELS[m]?.split(' ').pop() || m}</span>
            ))}
          </div>

          <h3 className="product-title">{product.title}</h3>

          <div className="product-price">
            <span className="price-current">{formatPrice(product.price)}</span>
            {discount && (
              <span className="price-with-code">{formatPrice(discountedPrice)} with code</span>
            )}
          </div>

          {discount && (
            <div className="discount-code">
              <span className="discount-value">{discount.code}</span>
              <span className="discount-percent">-{discount.percent}%</span>
            </div>
          )}
        </div>
      </Link>

      <div className="visit-button-container">
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="visit-button"
        >
          Visit {product.source} →
        </a>
      </div>

      <style jsx>{`
        .product-card {
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }
        .product-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
        .product-link {
          display: block;
          text-decoration: none;
          color: inherit;
          flex: 1;
        }
        .product-image-container {
          position: relative;
          aspect-ratio: 4/3;
          background: #f9fafb;
          overflow: hidden;
        }
        :global(.product-image) {
          object-fit: cover;
        }
        .product-image-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #9ca3af;
          font-size: 13px;
        }
        .discount-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #16a34a;
          color: #fff;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
        }
        .product-content {
          padding: 14px;
        }
        .product-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .product-source {
          font-size: 11px;
          color: #6b7280;
        }
        .product-model {
          font-size: 11px;
          color: #9ca3af;
        }
        .product-title {
          font-size: 14px;
          font-weight: 500;
          color: #111;
          margin: 0 0 10px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 40px;
        }
        .product-price {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .price-current {
          font-size: 18px;
          font-weight: 700;
          color: #111;
        }
        .price-with-code {
          font-size: 14px;
          font-weight: 600;
          color: #16a34a;
        }
        .discount-code {
          margin-top: 8px;
          padding: 8px 10px;
          background: #f0fdf4;
          border: 1px dashed #86efac;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .discount-value {
          font-size: 14px;
          font-weight: 700;
          color: #15803d;
          font-family: monospace;
          letter-spacing: 0.5px;
        }
        .discount-percent {
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          background: #16a34a;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .visit-button-container {
          padding: 0 14px 14px;
        }
        .visit-button {
          display: block;
          width: 100%;
          padding: 10px;
          background: #E82127;
          color: #fff;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          text-align: center;
          transition: background 0.2s ease;
        }
        .visit-button:hover {
          background: #c91c21;
        }
      `}</style>
    </div>
  );
}
