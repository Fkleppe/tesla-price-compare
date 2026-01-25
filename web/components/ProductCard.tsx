'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { getDiscountInfo, getAffiliateUrl } from '@/lib/affiliate';
import { generateSlug, MODEL_LABELS, formatPrice } from '@/lib/constants';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;
}

export default function ProductCard({ product, priority = false, index = 0 }: ProductCardProps) {
  const discount = getDiscountInfo(product.url);
  const slug = generateSlug(product.title);
  const affiliateUrl = getAffiliateUrl(product.url);
  const discountedPrice = discount
    ? product.price * (1 - discount.percent / 100)
    : product.price;

  const savings = discount ? product.price - discountedPrice : 0;

  return (
    <>
      <article
        className="product-card"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <Link href={`/product/${slug}`} className="card-link">
          {/* Image Container */}
          <div className="image-container">
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
              <div className="no-image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}

            {/* Badges */}
            {discount && (
              <div className="badge sale-badge">
                <span className="badge-percent">-{discount.percent}%</span>
              </div>
            )}

            {/* Hover Overlay */}
            <div className="hover-overlay">
              <span className="view-text">View Details</span>
            </div>
          </div>

          {/* Content */}
          <div className="card-content">
            {/* Meta Row */}
            <div className="meta-row">
              <span className="store-name">{product.source}</span>
              {product.models?.filter(m => m !== 'universal').slice(0, 1).map(m => (
                <span key={m} className="model-badge">
                  {MODEL_LABELS[m]?.split(' ').pop() || m}
                </span>
              ))}
            </div>

            {/* Title */}
            <h3 className="product-title">{product.title}</h3>

            {/* Price Section */}
            <div className="price-section">
              {discount ? (
                <>
                  <div className="price-row">
                    <span className="price-discounted">{formatPrice(discountedPrice)}</span>
                    <span className="price-original">{formatPrice(product.price)}</span>
                  </div>
                  <span className="savings-text">Save {formatPrice(savings)}</span>
                </>
              ) : (
                <span className="price-regular">{formatPrice(product.price)}</span>
              )}
            </div>

            {/* Discount Code */}
            {discount && (
              <div className="discount-box">
                <div className="code-section">
                  <span className="code-label">Code:</span>
                  <span className="code-value">{discount.code}</span>
                </div>
                <span className="code-badge">-{discount.percent}%</span>
              </div>
            )}
          </div>
        </Link>

        {/* CTA Button */}
        <div className="card-footer">
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="visit-btn"
          >
            <span>Shop at {product.source}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        </div>
      </article>

      <style jsx>{`
        .product-card {
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .product-card:hover {
          border-color: var(--border-default);
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .card-link {
          display: flex;
          flex-direction: column;
          flex: 1;
          text-decoration: none;
          color: inherit;
        }

        /* Image */
        .image-container {
          position: relative;
          aspect-ratio: 4/3;
          background: var(--bg-tertiary);
          overflow: hidden;
        }

        .product-card :global(.product-image) {
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .product-card:hover :global(.product-image) {
          transform: scale(1.05);
        }

        .no-image {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
        }

        .no-image svg {
          width: 48px;
          height: 48px;
          opacity: 0.5;
        }

        /* Badges */
        .sale-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 10px;
          background: var(--accent-success);
          border-radius: 8px;
          z-index: 2;
        }

        .badge-percent {
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
        }

        /* Hover Overlay */
        .hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .product-card:hover .hover-overlay {
          opacity: 1;
        }

        .view-text {
          padding: 10px 20px;
          background: white;
          color: var(--bg-primary);
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 8px;
          transform: translateY(10px);
          transition: transform 0.3s ease;
        }

        .product-card:hover .view-text {
          transform: translateY(0);
        }

        /* Content */
        .card-content {
          display: flex;
          flex-direction: column;
          padding: 1rem;
          flex: 1;
        }

        .meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .store-name {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .model-badge {
          font-size: 0.65rem;
          padding: 3px 8px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          color: var(--text-muted);
        }

        .product-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
          margin-bottom: 0.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 2.8em;
          transition: color 0.2s;
        }

        .product-card:hover .product-title {
          color: var(--accent-primary);
        }

        /* Price */
        .price-section {
          margin-top: auto;
          margin-bottom: 0.75rem;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .price-regular {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .price-discounted {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--accent-success);
        }

        .price-original {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .savings-text {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--accent-success);
          margin-top: 2px;
        }

        /* Discount Box */
        .discount-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.625rem 0.75rem;
          background: rgba(34, 197, 94, 0.1);
          border: 1px dashed rgba(34, 197, 94, 0.3);
          border-radius: 8px;
        }

        .code-section {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .code-label {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .code-value {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--accent-success);
          letter-spacing: 0.05em;
        }

        .code-badge {
          padding: 3px 8px;
          background: var(--accent-success);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 4px;
        }

        /* Footer */
        .card-footer {
          padding: 0 1rem 1rem;
        }

        .visit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--accent-primary);
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .visit-btn:hover {
          background: var(--accent-secondary);
          transform: translateY(-1px);
          box-shadow: var(--shadow-accent);
        }

        .visit-btn:active {
          transform: scale(0.98);
        }

        .visit-btn svg {
          width: 16px;
          height: 16px;
          transition: transform 0.2s;
        }

        .visit-btn:hover svg {
          transform: translate(2px, -2px);
        }
      `}</style>
    </>
  );
}
