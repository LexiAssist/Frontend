import { NextRequest, NextResponse } from 'next/server';
import { http } from '@/services/http';

// Get all quizzes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    const response = await http.get(`/api/v1/quizzes?limit=${limit}&offset=${offset}`);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Get quizzes error:', error);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to fetch quizzes', success: false },
      { status: error.response?.status || 500 }
    );
  }
}

// Create a new quiz
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await http.post('/api/v1/quizzes', {
      title: body.title,
      description: body.description,
      course_id: body.courseId,
      time_limit_minutes: body.timeLimitMinutes,
      difficulty: body.difficulty,
      questions: body.questions,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Create quiz error:', error);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to create quiz', success: false },
      { status: error.response?.status || 500 }
    );
  }
}
