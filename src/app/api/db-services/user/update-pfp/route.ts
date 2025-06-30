import axios from 'axios';
import { headers } from 'next/headers';

export const runtime = 'edge';

let imageURL = undefined;
let token = '';

export async function PUT(req): Promise<Response> {
  try {
    const authHeader = headers().get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove "Bearer " from the start
    }

    const formData = await req.formData();
    const pfp = formData.get('pfp');

    // Forward the file as part of a new FormData instance to the backend
    const pfpFormData = new FormData();
    pfpFormData.append('file', pfp);
    pfpFormData.append('filepath', 'user_custom_uploads/pfps/');
    // Upload PFP
    const imageUploadResponse = await fetch(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/gcp-bucket/upload`,
      {
        method: 'POST',
        body: pfpFormData,
        headers: {
          Authorization: `Bearer ${process.env.BACKEND_API_ADMIN_SECRET}`,
        },
      }
    );

    if (!imageUploadResponse.ok) {
      const errorText = await imageUploadResponse.text();
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

    imageURL = await imageUploadResponse.text();

    // Upload Custom PFP
    const responseData = await axios.put(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/user/user/pfp`,
      {
        pfpUrl: imageURL,
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
    if (imageURL) {
      await axios.delete(
        `${process.env.AGENT_BACKEND_API_BASE_URL}/gcp-bucket/delete-file`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BACKEND_API_ADMIN_SECRET}`,
          },
          data: {
            fileURL: imageURL,
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
