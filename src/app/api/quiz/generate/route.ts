import { NextRequest, NextResponse } from 'next/server';
import { http } from '@/services/http';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Call backend AI to generate quiz
    const response = await http.post('/api/v1/ai/generate/quiz', {
      query: body.content || body.topic || 'Generate a quiz',
      user_id: body.userId,
      context_chunks: body.contextChunks || [],
      material_id: body.materialId,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    
    return NextResponse.json(
      { 
        message: error.response?.data?.message || 'Failed to generate quiz',
        success: false 
      },
      { status: error.response?.status || 500 }
    );
  }
}
