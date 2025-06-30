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

    // Possibly retrieve token
    const authHeader = headers().get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    const backendUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/agent/${id}`;

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

    const data = await backendResponse.json();
    return NextResponse.json({ status: 'success', data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}

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

    const data = await req.json();

    data.bio = data.description ?? null;

    const backendUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/agent/${id}`;

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
      const errorJSON = JSON.parse(errorText);
      console.log('Agent update error text is', errorText);
      return NextResponse.json(
        {
          error: 'Update agent request failed',
          details: errorJSON?.error || errorJSON?.message,
        },
        { status: backendResponse.status }
      );
    }

    const respData = await backendResponse.json();
    return NextResponse.json({ status: 'success', data: respData });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Server error updating agent', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const backendUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/agent/${id}`;

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
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
