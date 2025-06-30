/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

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

    const authHeader = headers().get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    const backendUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/user/user-unfollow-agent/${id}`;

    const backendResponse = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.log('Error while unfollowing agent: ', errorText);
      return NextResponse.json(
        {
          error: 'UnFollow agent request failed',
          data: JSON.parse(errorText)?.message,
        },
        { status: backendResponse.status }
      );
    }

    const respData = await backendResponse.json();
    return NextResponse.json({ status: 'success', data: respData });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Server error unfollowing agent', data: error.message },
      { status: 500 }
    );
  }
}
