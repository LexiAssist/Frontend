import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { mockApi } from '@/lib/mockApi';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || !env.NEXT_PUBLIC_API_GATEWAY_URL;

/**
 * Course Materials API Routes
 */

// GET /api/materials - List all materials
export async function GET(request: NextRequest) {
  try {
    // Use mock API if enabled
    if (USE_MOCK) {
      console.log('[MOCK] Get materials');
      return NextResponse.json({ materials: mockApi.getMaterials() });
    }
    
    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/materials`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch materials' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Materials fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/materials - Upload new material
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Use mock API if enabled
    if (USE_MOCK) {
      console.log('[MOCK] Upload material:', file.name);
      const material = mockApi.uploadMaterial(file);
      return NextResponse.json({ 
        material,
        message: 'File uploaded successfully'
      });
    }
    
    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/materials`, {
      method: 'POST',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: 'Failed to upload material', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Materials POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/materials - Delete a material
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'No material ID provided' },
        { status: 400 }
      );
    }
    
    // Use mock API if enabled
    if (USE_MOCK) {
      console.log('[MOCK] Delete material:', id);
      return NextResponse.json({ 
        success: true,
        message: 'Material deleted'
      });
    }
    
    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/materials?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: 'Failed to delete material', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Materials DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
