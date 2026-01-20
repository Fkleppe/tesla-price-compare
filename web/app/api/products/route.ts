import { NextResponse } from 'next/server';
import { isAffiliatePartner } from '../../../lib/affiliate';
import allProducts from '../../../data/latest.json';

export async function GET() {
  try {
    // Filter out products under $10 and non-affiliate partners
    const products = allProducts.filter((p: { price: number; url: string }) =>
      p.price >= 10 && isAffiliatePartner(p.url)
    );
    return NextResponse.json(products);
  } catch {
    return NextResponse.json([]);
  }
}
