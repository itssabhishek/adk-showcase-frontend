/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

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

    const authHeader = headers().get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    const backendUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/user/user-follow-agent/${id}`;

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.log('Error while following agent: ', errorText);
      return NextResponse.json(
        {
          error: 'Follow agent request failed',
          data: JSON.parse(errorText)?.message,
        },
        { status: backendResponse.status }
      );
    }

    const respData = await backendResponse.json();
    return NextResponse.json({ status: 'success', data: respData });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Server error following agent', data: error.message },
      { status: 500 }
    );
  }
}

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
        { error: 'Missing access token' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/user/user-follow-agent/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json({ status: 'success', data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
