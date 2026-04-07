import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080';
    
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${backendUrl}/api/v1/ai/text-to-speech`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'TTS failed', status: response.status, details: errorText },
        { status: response.status }
      );
    }

    const audioBlob = await response.blob();
    return new NextResponse(audioBlob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
