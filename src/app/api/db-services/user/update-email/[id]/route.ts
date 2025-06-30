import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
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
      return NextResponse.json({ error: 'Token is missing.' }, { status: 400 });
    }

    const { email } = await req.json();

    // Update description
    const responseData = await fetch(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/user/update-email/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ email }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!responseData.ok) {
      const errorText = await responseData.text();
      return NextResponse.json(
        { error: 'Failed to fetch agent', details: errorText },
        { status: responseData.status }
      );
    }

    const respData = await responseData.json();
    return NextResponse.json(
      { status: 'success', data: respData },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: 'Server error', details: e.message },
      { status: 500 }
    );
  }
}
