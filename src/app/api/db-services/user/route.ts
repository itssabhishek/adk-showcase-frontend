import axios from 'axios';

export const runtime = 'edge';

export async function POST(request: Request) {
  // Ensure the request has a JSON body
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
          error: `Access token is required.`,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const backendUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/user/user`;

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
    // Handle any errors that occur during the process
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
