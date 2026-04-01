import { NextRequest, NextResponse } from 'next/server';
import { http } from '@/services/http';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Call backend AI chat service
    const response = await http.post('/api/v1/ai/chat', {
      query: body.query,
      user_id: body.userId,
      context_chunks: body.contextChunks || [],
      material_id: body.materialId,
      conversation_id: body.conversationId,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('AI chat error:', error);
    
    return NextResponse.json(
      { 
        message: error.response?.data?.message || 'Failed to get AI response',
        success: false 
      },
      { status: error.response?.status || 500 }
    );
  }
}
