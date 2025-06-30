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
    const { accessToken, newUserName } = await request.json();

    if (!accessToken || !newUserName) {
      return new Response(
        JSON.stringify({
          error: `accessToken, and new username is required. ${
            !accessToken ? 'accessToken is missing.' : ''
          } ${!newUserName ? 'new user name is missing.' : ''}`,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const backendUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/user/user/username`;

    const backendResponse = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ username: newUserName }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();

      try {
        const errorJson = JSON.parse(errorText);
        console.log('Error json is', errorJson);
        return new Response(
          JSON.stringify({
            error: 'Failed to process request',
            details: errorJson?.message,
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
            details: JSON.parse(errorText)?.error,
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
