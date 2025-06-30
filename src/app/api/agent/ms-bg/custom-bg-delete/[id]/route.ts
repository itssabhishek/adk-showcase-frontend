import axios from 'axios';
import { headers } from 'next/headers';

export const runtime = 'edge';

export async function DELETE(req): Promise<Response> {
  try {
    const id = req?.nextUrl?.pathname?.split('/').at(-1);
    if (!id) {
      throw new Error('Please provide an ID for the background to delete.');
    }
    const authHeader = headers().get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove "Bearer " from the start
    }

    // Deleting BG
    await axios.delete(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/user/delete-custom-bg/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return new Response(JSON.stringify({ status: 'success' }), {
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
