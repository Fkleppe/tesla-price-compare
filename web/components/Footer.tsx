'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TESLA_MODELS, CATEGORIES, SITE_NAME } from '@/lib/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showEmail, setShowEmail] = useState(false);

  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-8 mt-20 border-t border-gray-800">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block text-xl font-bold text-white mb-4 hover:opacity-80 transition-opacity">
              EV<span className="text-red-600">PriceHunt</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Find the best deals on Tesla and EV accessories with exclusive discount codes from verified retailers.
            </p>
          </div>

          {/* Tesla Models */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Tesla Models</h4>
            <ul className="space-y-2.5">
              {TESLA_MODELS.filter(m => m.id !== 'universal').slice(0, 6).map(model => (
                <li key={model.id}>
                  <Link
                    href={`/model/${model.id}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {model.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {CATEGORIES.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.id}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2.5 mb-6">
              <li>
                <Link href="/top-10" className="text-sm hover:text-white transition-colors">
                  Top 10 Lists
                </Link>
              </li>
              <li>
                <Link href="/stores" className="text-sm hover:text-white transition-colors">
                  Partner Stores
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>

            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            {showEmail ? (
              <a
                href="mailto:kontakt@statika-as.com"
                className="inline-block text-sm text-red-400 hover:text-red-300 bg-red-950/30 px-3 py-2 rounded-md border border-red-900/30 transition-colors"
              >
                kontakt@statika-as.com
              </a>
            ) : (
              <button
                onClick={() => setShowEmail(true)}
                className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
              >
                Show Email
              </button>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-center md:text-left">
            &copy; {currentYear} {SITE_NAME}. Not affiliated with Tesla, Inc.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
