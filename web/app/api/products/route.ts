import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { isAffiliatePartner } from '../../../lib/affiliate';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), '..', 'data', 'latest.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const allProducts = JSON.parse(data);
    // Filter out products under $10 and non-affiliate partners
    const products = allProducts.filter((p: { price: number; url: string }) =>
      p.price >= 10 && isAffiliatePartner(p.url)
    );
    return NextResponse.json(products);
  } catch (error) {
    // Return demo data if file doesn't exist
    const demoProducts = [
      { title: 'Tesla Model 3 All-Weather Floor Mats', price: 129.99, currency: 'USD', url: '#', source: 'Demo', category: 'Model 3', scrapedAt: new Date().toISOString() },
      { title: 'Tesla Model Y Cargo Mat', price: 89.99, currency: 'USD', url: '#', source: 'Demo', category: 'Model Y', scrapedAt: new Date().toISOString() },
      { title: 'Tesla Wall Connector Gen 3', price: 425.00, currency: 'USD', url: '#', source: 'Charging', category: 'Charging', scrapedAt: new Date().toISOString() },
      { title: 'Tesla Model 3 Center Console Wrap', price: 34.99, currency: 'USD', url: '#', source: 'Demo', category: 'Model 3', scrapedAt: new Date().toISOString() },
      { title: 'Tesla Screen Protector 15" Display', price: 29.99, currency: 'USD', url: '#', source: 'Demo', category: 'Accessories', scrapedAt: new Date().toISOString() },
      { title: 'Tesla Model Y Roof Rack', price: 449.00, currency: 'USD', url: '#', source: 'Demo', category: 'Model Y', scrapedAt: new Date().toISOString() },
      { title: 'Tesla Wireless Phone Charger', price: 79.99, currency: 'USD', url: '#', source: 'Demo', category: 'Accessories', scrapedAt: new Date().toISOString() },
      { title: 'Tesla Model 3 Mud Flaps', price: 44.99, currency: 'USD', url: '#', source: 'Demo', category: 'Model 3', scrapedAt: new Date().toISOString() },
    ];
    return NextResponse.json(demoProducts);
  }
}
