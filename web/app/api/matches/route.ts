import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Try AI matches first (higher quality), then fall back to regular matches
    const aiMatchesPath = path.join(process.cwd(), '..', 'data', 'ai-matches.json');
    const regularMatchesPath = path.join(process.cwd(), '..', 'data', 'matches.json');

    let matches = [];

    try {
      const aiData = await fs.readFile(aiMatchesPath, 'utf-8');
      matches = JSON.parse(aiData);
    } catch {
      // Fall back to regular matches
      const regularData = await fs.readFile(regularMatchesPath, 'utf-8');
      matches = JSON.parse(regularData);
    }

    return NextResponse.json(matches);
  } catch (error) {
    // Return demo matches if file doesn't exist
    const demoMatches = [
      {
        matchKey: 'tesla-model-floor-mats-allweather',
        category: 'floor-mats',
        models: ['model-3', 'model-y'],
        lowestPrice: 89.99,
        highestPrice: 149.99,
        savings: 60,
        savingsPercent: 40,
        products: [
          {
            title: 'Tesla Model 3/Y All-Weather Floor Mats',
            price: 89.99,
            currency: 'USD',
            url: 'https://example.com/product1',
            image: '',
            source: 'Tesmanian',
            sourceId: 'tesmanian',
            category: 'floor-mats',
            models: ['model-3', 'model-y']
          },
          {
            title: 'Tesla Model 3/Y All-Weather Floor Mats Set',
            price: 119.99,
            currency: 'USD',
            url: 'https://example.com/product2',
            image: '',
            source: 'Tesery',
            sourceId: 'tesery',
            category: 'floor-mats',
            models: ['model-3', 'model-y']
          },
          {
            title: 'All-Weather Floor Mats for Tesla Model 3/Y',
            price: 149.99,
            currency: 'USD',
            url: 'https://example.com/product3',
            image: '',
            source: 'EVANNEX',
            sourceId: 'evannex',
            category: 'floor-mats',
            models: ['model-3', 'model-y']
          }
        ]
      },
      {
        matchKey: 'tesla-screen-protector-tempered-glass',
        category: 'screen-protectors',
        models: ['model-3', 'model-y'],
        lowestPrice: 19.99,
        highestPrice: 39.99,
        savings: 20,
        savingsPercent: 50,
        products: [
          {
            title: 'Tesla Screen Protector Tempered Glass',
            price: 19.99,
            currency: 'USD',
            url: 'https://example.com/product4',
            image: '',
            source: 'Yeslak',
            sourceId: 'yeslak',
            category: 'screen-protectors',
            models: ['model-3', 'model-y']
          },
          {
            title: 'Tempered Glass Screen Protector for Tesla',
            price: 39.99,
            currency: 'USD',
            url: 'https://example.com/product5',
            image: '',
            source: 'Tesloid',
            sourceId: 'tesloid',
            category: 'screen-protectors',
            models: ['model-3', 'model-y']
          }
        ]
      },
      {
        matchKey: 'tesla-center-console-wrap-carbon',
        category: 'center-console',
        models: ['model-3'],
        lowestPrice: 29.99,
        highestPrice: 49.99,
        savings: 20,
        savingsPercent: 40,
        products: [
          {
            title: 'Tesla Model 3 Center Console Wrap Carbon Fiber',
            price: 29.99,
            currency: 'USD',
            url: 'https://example.com/product6',
            image: '',
            source: 'Tesery',
            sourceId: 'tesery',
            category: 'center-console',
            models: ['model-3']
          },
          {
            title: 'Carbon Fiber Center Console Wrap for Model 3',
            price: 49.99,
            currency: 'USD',
            url: 'https://example.com/product7',
            image: '',
            source: 'RPM Tesla',
            sourceId: 'rpmtesla',
            category: 'center-console',
            models: ['model-3']
          }
        ]
      }
    ];
    return NextResponse.json(demoMatches);
  }
}
