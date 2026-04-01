import { NextRequest, NextResponse } from 'next/server';
import { http } from '@/services/http';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Call backend to generate flashcards from content
    const response = await http.post('/api/v1/ai/generate/flashcards', {
      query: body.content || body.document?.name || 'Generate flashcards',
      user_id: body.userId,
      context_chunks: body.contextChunks || [],
      material_id: body.materialId,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Flashcard generation error:', error);
    
    return NextResponse.json(
      { 
        message: error.response?.data?.message || 'Failed to generate flashcards',
        success: false 
      },
      { status: error.response?.status || 500 }
    );
  }
}
