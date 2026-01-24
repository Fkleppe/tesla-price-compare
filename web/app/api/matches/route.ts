import { NextResponse } from 'next/server';
import { dataCache } from '../../../lib/cache';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const CACHE_KEY = 'ai-matches';

    // Try to get from cache first
    let aiMatches = dataCache.get<unknown>(CACHE_KEY);

    if (!aiMatches) {
      const matchesPath = path.join(process.cwd(), 'data', 'ai-matches.json');
      const data = await fs.readFile(matchesPath, 'utf-8');
      aiMatches = JSON.parse(data);

      // Store in cache
      dataCache.set(CACHE_KEY, aiMatches);
    }

    return NextResponse.json(aiMatches);
  } catch (error) {
    return NextResponse.json([]);
  }
}
