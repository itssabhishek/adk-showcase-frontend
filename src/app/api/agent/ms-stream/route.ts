import axios from 'axios';
import { headers } from 'next/headers';

export const runtime = 'edge';

export async function GET(request: Request) {
  const apiUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/stream`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${process.env.BACKEND_API_ADMIN_SECRET}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({ status: 'success', data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req): Promise<Response> {
  try {
    const authHeader = headers().get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove "Bearer " from the start
    }

    const data = await req.json();

    // Add New Stream
    const responseData = await axios.post(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/stream`,
      data,
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
