export const runtime = 'edge';

export async function POST(request: Request) {
  // Ensure the request has a JSON body
  if (!request.headers.get('Content-Type')?.includes('application/json')) {
    return new Response(
      JSON.stringify({ error: 'Expected JSON content type' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    const { accessToken, referralCode } = await request.json();

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          error: 'access token is required',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // const backendUrl = 'https://alias-back-v006-z5i43m3uta-uc.a.run.app/api/auth/verify';
    const backendUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/auth/verify`;

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        referralCode,
      }),
    });

    if (!backendResponse.ok) {
      const errorResponse = await backendResponse.text();
      return new Response(
        JSON.stringify({
          error: 'Failed to process request',
          details: errorResponse,
        }),
        {
          status: backendResponse.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await backendResponse.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Handle generic errors
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Unexpected error occurred', details: error }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
