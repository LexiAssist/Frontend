import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1/analytics/study-stats`, {
      headers: {
        'Authorization': authHeader || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Failed to fetch analytics', success: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch analytics', success: false },
      { status: 500 }
    );
  }
}
