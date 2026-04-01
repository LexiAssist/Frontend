import { NextRequest, NextResponse } from 'next/server';
import { http } from '@/services/http';

export async function GET(request: NextRequest) {
  try {
    const response = await http.get('/api/v1/analytics/study-stats');
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to fetch analytics', success: false },
      { status: error.response?.status || 500 }
    );
  }
}
