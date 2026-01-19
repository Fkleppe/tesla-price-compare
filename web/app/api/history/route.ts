import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const historyPath = path.join(process.cwd(), '..', 'data', 'price-history.json');
    const data = await fs.readFile(historyPath, 'utf-8');
    const history = JSON.parse(data);
    return NextResponse.json(history);
  } catch (error) {
    // Return demo history data if file doesn't exist
    const today = new Date();
    const demoHistory: Record<string, { title: string; source: string; category: string; prices: { date: string; price: number }[] }> = {};

    const demoProducts = [
      { title: 'Tesla Model 3 All-Weather Floor Mats', source: 'Demo', category: 'Model 3', basePrice: 129.99 },
      { title: 'Tesla Model Y Cargo Mat', source: 'Demo', category: 'Model Y', basePrice: 89.99 },
      { title: 'Tesla Wall Connector Gen 3', source: 'Demo', category: 'Charging', basePrice: 425.00 },
      { title: 'Tesla Model 3 Center Console Wrap', source: 'Demo', category: 'Model 3', basePrice: 34.99 },
      { title: 'Tesla Screen Protector 15" Display', source: 'Demo', category: 'Accessories', basePrice: 29.99 },
    ];

    for (const product of demoProducts) {
      const id = `demo-${product.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').slice(0, 50)}`;
      const prices = [];

      // Generate 30 days of price history with some variation
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const variation = (Math.random() - 0.5) * 0.1 * product.basePrice;
        prices.push({
          date: date.toISOString().split('T')[0],
          price: Math.round((product.basePrice + variation) * 100) / 100
        });
      }

      demoHistory[id] = {
        title: product.title,
        source: product.source,
        category: product.category,
        prices
      };
    }

    return NextResponse.json(demoHistory);
  }
}
