import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'Missing agent ID in URL.' },
        { status: 400 }
      );
    }

    // Possibly retrieve token
    const authHeader = headers().get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Auth token not found' },
        { status: 404 }
      );
    }

    const backendUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/stream/${id}/messages`;

    const backendResponse = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        { error: 'Failed to fetch agent', details: errorText },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json({ status: 'success', data }, { status: 200 });
  } catch (error) {
    console.error('Error deleting messages:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
