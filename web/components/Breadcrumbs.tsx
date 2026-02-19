'use client';

import Link from 'next/link';
import { BreadcrumbItem } from '@/lib/types';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {index > 0 && <span className="breadcrumb-separator">/</span>}
            {item.href ? (
              <Link href={item.href} className="breadcrumb-link">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>

      <style jsx>{`
        .breadcrumbs {
          padding: 1rem 0;
        }
        .breadcrumb-list {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          font-size: 0.8rem;
        }
        .breadcrumb-item {
          display: flex;
          align-items: center;
        }
        .breadcrumb-separator {
          margin: 0 0.625rem;
          color: var(--text-muted);
          opacity: 0.5;
        }
        .breadcrumb-link {
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s;
        }
        .breadcrumb-link:hover {
          color: var(--text-primary);
        }
        .breadcrumb-current {
          color: var(--text-primary);
          font-weight: 500;
        }
      `}</style>
    </nav>
  );
}
