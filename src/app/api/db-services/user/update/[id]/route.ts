/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function PUT(
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

    // parse the entire body, including "animations"
    const data = await req.json();

    const backendUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/user/user/${id}`;

    const backendResponse = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.log('Display name error text is', errorText);
      return NextResponse.json(
        {
          error: 'Update profile request failed',
          data: JSON.parse(errorText)?.message,
        },
        { status: backendResponse.status }
      );
    }

    const respData = await backendResponse.json();
    return NextResponse.json({ status: 'success', data: respData });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Server error updating agent', data: error.message },
      { status: 500 }
    );
  }
}
