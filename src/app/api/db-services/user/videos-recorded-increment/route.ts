export const runtime = 'edge';

export async function POST(request: Request) {
  if (request.headers.get('Content-Type') !== 'application/json') {
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
    const { accessToken } = await request.json();

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          error: `accessToken is required.`,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const backendUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/db-services/user/videos-recorded-increment`;

    const backendResponse = await fetch(backendUrl, {
      method: 'PUT',
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
