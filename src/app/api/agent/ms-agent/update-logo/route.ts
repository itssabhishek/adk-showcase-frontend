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
    const image = formData.get('image'); // Assuming the field name is 'file'
    const agentID = formData.get('agentID');

    if (image) {
      // Forward the file as part of a new FormData instance to the backend
      const backendFormData = new FormData();
      backendFormData.append('file', image);
      backendFormData.append('filepath', 'user_custom_uploads/agents/');

      // Upload Image
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
      imageURL = await backendResponse.text();
    }

    // Update Custom Image
    const backendUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/agent/${agentID}`;

    const backendResponse = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ logo: imageURL }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error('Error in updating agent. ' + errorText);
    }

    const respData = await backendResponse.json();
    return new Response(JSON.stringify({ status: 'success', data: respData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
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
