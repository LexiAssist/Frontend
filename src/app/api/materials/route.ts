import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { mockApi } from '@/lib/mockApi';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || !env.NEXT_PUBLIC_API_GATEWAY_URL;

// GET /api/materials - List all materials
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (USE_MOCK) {
      console.log('[MOCK] Get materials');
      return NextResponse.json({ materials: mockApi.getMaterials() });
    }
    
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1/materials`, { headers });

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/materials - Upload new material
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (USE_MOCK) {
      // Parse form data for mock
      const formData = await request.formData();
      const file = formData.get('file') as File;
      console.log('[MOCK] Upload material:', file?.name);
      const material = mockApi.uploadMaterial(file);
      return NextResponse.json({ material, message: 'File uploaded successfully' });
    }
    
    // Forward the request to backend
    // Get the form data from the request
    const formData = await request.formData();
    
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1/materials`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend upload error:', errorText);
      return NextResponse.json(
        { error: 'Failed to upload material', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Materials POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/materials - Delete a material
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const authHeader = request.headers.get('authorization');
    
    if (!id) {
      return NextResponse.json({ error: 'No material ID provided' }, { status: 400 });
    }
    
    if (USE_MOCK) {
      console.log('[MOCK] Delete material:', id);
      return NextResponse.json({ success: true, message: 'Material deleted' });
    }
    
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1/materials?id=${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to delete material', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Materials DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
