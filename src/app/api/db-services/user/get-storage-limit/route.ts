import { headers } from 'next/headers';
export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const authHeader = headers().get('authorization');
    let accessToken = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7); // Remove "Bearer " from the start
    }

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          error: `accessToken  is missing.`,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const backendUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/db-services/user/get-storage-limit`;

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();

      try {
        const errorJson = JSON.parse(errorText);
        return new Response(
          JSON.stringify({
            error: 'Failed to process request',
            details: errorJson,
          }),
          {
            status: backendResponse.status,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (e) {
        return new Response(
          JSON.stringify({
            error: 'Failed to process request',
            details: errorText,
          }),
          {
            status: backendResponse.status,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    const data = await backendResponse.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
