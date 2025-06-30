import axios from 'axios';
import { headers } from 'next/headers';

export const runtime = 'edge';

export async function GET(req): Promise<Response> {
  try {
    const id = req?.nextUrl?.pathname?.split('/').at(-1);
    if (!id) {
      throw new Error('Please provide an ID for the steam.');
    }
    // const authHeader = headers().get('authorization');
    // let token = '';
    // if (authHeader && authHeader.startsWith('Bearer ')) {
    //   token = authHeader.substring(7); // Remove "Bearer " from the start
    // }

    // Getting Stream
    const data = await axios.get(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/stream/${id}`
      // {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // }
    );

    return new Response(
      JSON.stringify({ status: 'success', data: data.data }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
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

export async function PUT(req): Promise<Response> {
  try {
    const id = req?.nextUrl?.pathname?.split('/').at(-1);
    if (!id) {
      throw new Error('Please provide an ID for the stream.');
    }
    const authHeader = headers().get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove "Bearer " from the start
    }

    // Updating data
    const data = await req.json();

    const res = await axios.put(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/stream/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return new Response(JSON.stringify({ status: 'success', data: res.data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
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
