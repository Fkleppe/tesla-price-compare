// Server-side rendered product grid for SEO
// This component renders static HTML that Google can crawl
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../lib/types';
import { getDiscountInfo, getAffiliateUrl, isAffiliatePartner } from '../lib/affiliate';
import styles from './ProductGridSSR.module.css';

interface ProductGridSSRProps {
  products: Product[];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

const MODEL_LABELS: Record<string, string> = {
  'model-3': 'Model 3',
  'highland': 'Highland',
  'model-y': 'Model Y',
  'juniper': 'Juniper',
  'model-s': 'Model S',
  'model-x': 'Model X',
  'cybertruck': 'Cybertruck',
};

export default function ProductGridSSR({ products }: ProductGridSSRProps) {
  return (
    <section className={styles.products}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {products.map((product, idx) => {
            const discount = getDiscountInfo(product.url);
            const affiliateUrl = getAffiliateUrl(product.url);
            const isPartner = isAffiliatePartner(product.url);

            return (
              <article key={`${product.url}-${idx}`} className={styles.card}>
                <Link href={`/product/${generateSlug(product.title)}`} className={styles.link}>
                  <div className={styles.imageWrap}>
                    {product.image && (
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, 20vw"
                        style={{ objectFit: 'cover' }}
                        loading={idx < 8 ? 'eager' : 'lazy'}
                      />
                    )}
                    {discount && (
                      <span className={styles.badge}>-{discount.percent}%</span>
                    )}
                    {isPartner && !discount && (
                      <span className={styles.partner}>Partner</span>
                    )}
                  </div>
                  <div className={styles.body}>
                    <div className={styles.meta}>
                      <span className={styles.store}>{product.source}</span>
                      {product.models?.filter(m => m !== 'universal').slice(0, 1).map(m => (
                        <span key={m} className={styles.model}>{MODEL_LABELS[m] || m}</span>
                      ))}
                    </div>
                    <h3 className={styles.title}>{product.title}</h3>
                    <div className={styles.pricing}>
                      <span className={styles.price}>${product.price.toFixed(0)}</span>
                      {discount && (
                        <span className={styles.savings}>
                          ${(product.price * (1 - discount.percent / 100)).toFixed(0)} with code
                        </span>
                      )}
                    </div>
                    {discount && (
                      <div className={styles.discount}>
                        <span className={styles.code}>{discount.code}</span>
                        <span className={styles.percent}>-{discount.percent}%</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className={styles.footer}>
                  <a href={affiliateUrl} target="_blank" rel="noopener noreferrer" className={styles.btn}>
                    Shop at {product.source}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
