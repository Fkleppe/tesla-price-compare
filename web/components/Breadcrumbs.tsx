'use client';

import Link from 'next/link';
import { BreadcrumbItem } from '@/lib/types';
import { SITE_URL } from '@/lib/constants';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Generate JSON-LD structured data for breadcrumbs
  // Only include items with href to avoid undefined values in JSON-LD
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
      .filter((item, index) => index === 0 || item.href) // Always include first item (Home), filter others without href
      .map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: item.href ? `${SITE_URL}${item.href}` : SITE_URL, // Home gets SITE_URL, others get full path
      })),
  };

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
          padding: 16px 0;
        }
        .breadcrumb-list {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          font-size: 13px;
        }
        .breadcrumb-item {
          display: flex;
          align-items: center;
        }
        .breadcrumb-separator {
          margin: 0 10px;
          color: #d1d5db;
        }
        .breadcrumb-link {
          color: #6b7280;
          text-decoration: none;
          transition: color 0.2s;
        }
        .breadcrumb-link:hover {
          color: #111;
        }
        .breadcrumb-current {
          color: #111;
          font-weight: 500;
        }
      `}</style>
    </nav>
  );
}
