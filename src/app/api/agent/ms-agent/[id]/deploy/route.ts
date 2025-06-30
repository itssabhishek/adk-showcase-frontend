/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(
  req: Request,
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

    const authHeader = headers().get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const backendUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/agent/${id}/deploy`;

    console.log(backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        { error: 'Deploy request failed', details: errorText },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Server error deploying agent', details: error.message },
      { status: 500 }
    );
  }
}
