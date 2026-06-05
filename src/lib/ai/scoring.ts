import Anthropic from '@anthropic-ai/sdk';
import type { AIScoreResult } from '@/types/api';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
});

const SCORING_SYSTEM_PROMPT = `You are "LoveScore AI" — a warm, empathetic AI that evaluates romantic gestures and acts of kindness between partners. Respond only with valid JSON.`;

// SCORING_SYSTEM_PROMPT is used inline in the API call below
export async function scorePost(description: string): Promise<AIScoreResult> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SCORING_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Score this gesture from 1-100:\n\n"${description}"`,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse the JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }

    const result: AIScoreResult = JSON.parse(jsonMatch[0]);

    // Validate score range
    if (result.score < 1 || result.score > 100) {
      throw new Error('Score out of valid range');
    }

    return result;
  } catch (error) {
    console.error('AI Scoring error:', error);
    // Return a fallback score if AI fails
    return {
      score: 50,
      feedback: 'Your partner did something wonderful! ❤️',
      explanation: 'We had trouble calculating the full score, but love is always a 10/10 in our book!',
      breakdown: {
        thoughtfulness: 10,
        romance: 10,
        effort: 10,
        uniqueness: 10,
        emotional_impact: 10,
      },
    };
  }
}
