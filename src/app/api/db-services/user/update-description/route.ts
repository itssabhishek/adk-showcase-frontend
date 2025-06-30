import axios from 'axios';
import { headers } from 'next/headers';

export const runtime = 'edge';

export async function PUT(req): Promise<Response> {
  try {
    let token = '';
    const authHeader = headers().get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove "Bearer " from the start
    }

    const { description } = await req.json();

    // Update description
    const responseData = await axios.put(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/user/update-user-description`,
      {
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return new Response(
      JSON.stringify({ status: 'success', data: responseData }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    console.error(e.message);
    return new Response(
      JSON.stringify({
        status: 'fail',
        data: e?.response?.data?.error || e?.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
