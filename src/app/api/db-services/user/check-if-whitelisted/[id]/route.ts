/* eslint-disable */
import { NextResponse } from 'next/server';

import { headers } from 'next/headers';

export const runtime = 'edge';

export async function GET(
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

    // Possibly retrieve token
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    const backendUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/user/is-whitelisted-for-agent-creation/${id}`;

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
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

    const respData = await backendResponse.json();
    return NextResponse.json(
      { status: 'success', data: respData },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
