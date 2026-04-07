import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const authHeader = request.headers.get('authorization');
    
    // Extract fields from the request
    const file = formData.get('file') as File;
    const userId = formData.get('user_id') as string;
    const summaryType = (formData.get('summary_type') as string) || 'concise';
    const voice = (formData.get('voice') as string) || 'Zephyr';
    const speakerLabel = (formData.get('speaker_label') as string) || 'Reader';
    const temperature = (formData.get('temperature') as string) || '1.0';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No user_id provided' },
        { status: 400 }
      );
    }
    
    // Create new form data for backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    backendFormData.append('user_id', userId);
    backendFormData.append('summary_type', summaryType);
    backendFormData.append('voice', voice);
    backendFormData.append('speaker_label', speakerLabel);
    backendFormData.append('temperature', temperature);
    
    const backendUrl = env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080';
    
    console.log('[Reading API] Sending request to:', `${backendUrl}/api/v1/reading/analyse`);
    console.log('[Reading API] User ID:', userId);
    console.log('[Reading API] File:', file.name, file.type, file.size);
    
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Use AbortController with 5-minute timeout for AI analysis
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);
    
    const response = await fetch(`${backendUrl}/api/v1/reading/analyse`, {
      method: 'POST',
      headers,
      body: backendFormData,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const responseText = await response.text();
    console.log('[Reading API] Response status:', response.status);
    console.log('[Reading API] Response body:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Analysis failed', status: response.status, details: responseText },
        { status: response.status }
      );
    }

    // Parse successful response
    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        { error: 'Invalid response from backend', details: responseText },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Reading API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
