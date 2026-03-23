import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { mockApi } from '@/lib/mockApi';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || !env.NEXT_PUBLIC_API_GATEWAY_URL;

/**
 * Flashcards / Study Sets API Routes
 */

// GET /api/flashcards - List all study sets
export async function GET(request: NextRequest) {
  try {
    // Use mock API if enabled
    if (USE_MOCK) {
      console.log('[MOCK] Get study sets');
      return NextResponse.json({ studySets: mockApi.getStudySets() });
    }
    
    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/study-sets`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch study sets' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Study sets fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/flashcards - Create new study set or generate from text
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Use mock API if enabled
    if (USE_MOCK) {
      console.log('[MOCK] Flashcards action:', body.action || 'create');
      
      if (body.action === 'generate' && body.text) {
        // Generate flashcards from text
        const aiResponse = mockApi.generateContent(body.text, 'flashcards');
        const cards = JSON.parse(aiResponse).cards;
        return NextResponse.json({ 
          cards,
          message: 'Flashcards generated successfully'
        });
      }
      
      return NextResponse.json({ 
        studySet: mockApi.getStudySetById('1'),
        message: 'Study set created'
      });
    }
    
    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/study-sets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: 'Failed to create study set', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Flashcards POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
