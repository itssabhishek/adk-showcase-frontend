// pages/api/images/[...path].ts

export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return new NextResponse('Invalid path', { status: 400 });
  }

  // Sanitize the path to prevent directory traversal attacks
  if (path.includes('..')) {
    return new NextResponse('Invalid path', { status: 400 });
  }

  try {
    // Use the provided URL directly
    const response = await fetch(path);

    if (!response.ok) {
      return new NextResponse('Image not found', { status: response.status });
    }

    // Get the content type from the response
    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';

    // Read the response body as an array buffer
    const arrayBuffer = await response.arrayBuffer();

    // Create the response with the image data and headers
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cross-Origin-Resource-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
