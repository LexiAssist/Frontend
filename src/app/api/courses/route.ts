import { NextRequest, NextResponse } from 'next/server';
import { http } from '@/services/http';

// Get all courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    const response = await http.get(`/api/v1/courses?limit=${limit}&offset=${offset}`);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to fetch courses', success: false },
      { status: error.response?.status || 500 }
    );
  }
}

// Create a new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await http.post('/api/v1/courses', {
      name: body.name,
      description: body.description,
      color: body.color,
      semester: body.semester,
      year: body.year,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to create course', success: false },
      { status: error.response?.status || 500 }
    );
  }
}
