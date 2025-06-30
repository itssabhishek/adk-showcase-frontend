import axios from 'axios';
import { headers } from 'next/headers';

export const runtime = 'edge';

let bgURL = undefined;
let token = '';

export async function POST(req): Promise<Response> {
  try {
    const authHeader = headers().get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove "Bearer " from the start
    }

    const formData = await req.formData();
    const bg = formData.get('bg'); // Assuming the field name is 'file'
    const name = formData.get('name');
    const description = formData.get('description');
    // const bgConfigType = formData.get('bgConfigType');

    // Forward the file as part of a new FormData instance to the backend
    const backendFormData = new FormData();
    backendFormData.append('file', bg);
    backendFormData.append('filepath', 'user_custom_uploads/bgs/');

    // Upload BG
    const backendResponse = await fetch(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/gcp-bucket/upload`,
      {
        method: 'POST',
        body: backendFormData,
        headers: {
          Authorization: `Bearer ${process.env.BACKEND_API_ADMIN_SECRET}`,
        },
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.log('Error text is', errorText);
      return new Response(
        JSON.stringify({
          status: 'fail',
          data: JSON.parse(errorText)?.error,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    bgURL = await backendResponse.text();

    // Upload Custom BG
    const responseData = await axios.post(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/user/upload-custom-bg`,
      {
        name,
        imageUrl: bgURL,
        description,
        tags: ['custom'],
        bgConfig: {
          type: 'Static',
        },
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
    if (bgURL) {
      await axios.delete(
        `${process.env.AGENT_BACKEND_API_BASE_URL}/gcp-bucket/delete-file`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BACKEND_API_ADMIN_SECRET}`,
          },
          data: {
            fileURL: bgURL,
          },
        }
      );
    }
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
