import { NextResponse } from 'next/server';
import { scorePost } from '@/lib/ai/scoring';
import type { AIScoreResult } from '@/types/api';

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    if (description.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Description must be at least 10 characters' },
        { status: 400 }
      );
    }

    const result: AIScoreResult = await scorePost(description);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('AI Score API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to score post' },
      { status: 500 }
    );
  }
}
