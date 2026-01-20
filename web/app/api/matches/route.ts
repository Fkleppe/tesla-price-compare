import { NextResponse } from 'next/server';
import aiMatches from '../../../data/ai-matches.json';

export async function GET() {
  return NextResponse.json(aiMatches);
}
