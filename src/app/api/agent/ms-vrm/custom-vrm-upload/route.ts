import axios from 'axios';
import { headers } from 'next/headers';

export const runtime = 'edge';

let vrmURL = undefined;
let previewImageURL = undefined;
let token = '';

export async function POST(req): Promise<Response> {
  try {
    const authHeader = headers().get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove "Bearer " from the start
    }

    const formData = await req.formData();
    const vrm = formData.get('vrm'); // Assuming the field name is 'file'
    const previewImage = formData.get('previewImage');
    const name = formData.get('name');
    const description = formData.get('description');
    // const vrmConfigOffsetOne = formData.get('vrmConfigOffsetOne');
    // const vrmConfigOffsetTwo = formData.get('vrmConfigOffsetTwo');
    // const vrmConfigOffsetThree = formData.get('vrmConfigOffsetThree');

    // Forward the file as part of a new FormData instance to the backend
    const vrmFormData = new FormData();
    vrmFormData.append('file', vrm);
    vrmFormData.append('filepath', 'user_custom_uploads/vrms/');
    // Upload VRM
    const vrmUploadResponse = await fetch(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/gcp-bucket/upload`,
      {
        method: 'POST',
        body: vrmFormData,
        headers: {
          Authorization: `Bearer ${process.env.BACKEND_API_ADMIN_SECRET}`,
        },
      }
    );

    if (!vrmUploadResponse.ok) {
      const errorText = await vrmUploadResponse.text();
      throw new Error(
        JSON.parse(errorText)?.error || JSON.parse(errorText)?.message
      );
    }

    let previewImageResponse;
    if (previewImage) {
      // Forward the file as part of a new FormData instance to the backend
      const previewImageFormData = new FormData();
      previewImageFormData.append('file', previewImage);
      previewImageFormData.append(
        'filepath',
        'user_custom_uploads/vrms/vrm_thumbs/'
      );

      // Upload Preview Image
      previewImageResponse = await fetch(
        `${process.env.AGENT_BACKEND_API_BASE_URL}/gcp-bucket/upload`,
        {
          method: 'POST',
          body: previewImageFormData,
          headers: {
            Authorization: `Bearer ${process.env.BACKEND_API_ADMIN_SECRET}`,
          },
        }
      );
      if (!previewImageResponse.ok) {
        const errorText = await previewImageResponse.text();
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
    }
    vrmURL = await vrmUploadResponse.text();
    previewImageURL = previewImageResponse
      ? await previewImageResponse.text()
      : undefined;

    // Upload Custom VRM
    const responseData = await axios.post(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/user/upload-custom-vrm`,
      {
        name,
        fileUrl: vrmURL,
        thumbnailUrl: previewImageURL,
        description,
        tags: ['custom'],
        vrmConfig: {
          offset: [0, -0.1, 0],
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
    console.error('Error uploading custom VRM', e);
    if (vrmURL) {
      await axios.delete(
        `${process.env.AGENT_BACKEND_API_BASE_URL}/gcp-bucket/delete-file`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BACKEND_API_ADMIN_SECRET}`,
          },
          data: {
            fileURL: vrmURL,
          },
        }
      );
    }
    if (previewImageURL) {
      await axios.delete(
        `${process.env.AGENT_BACKEND_API_BASE_URL}/gcp-bucket/delete-file`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BACKEND_API_ADMIN_SECRET}`,
          },
          data: {
            fileURL: previewImageURL,
          },
        }
      );
    }
    return new Response(
      JSON.stringify({
        status: 'fail',
        data: e?.response?.data?.error || e?.message || e,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
