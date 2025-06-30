export const runtime = 'edge';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file'); // Assuming the field name is 'file'

    // Remember to enforce type here and after use some lib like zod.js to check it
    const files = formData.getAll('file') as File[];

    console.log(files);

    // Forward the file as part of a new FormData instance to the backend
    const backendFormData = new FormData();
    backendFormData.append(
      'file',
      new Blob([file.stream()], { type: file.type }),
      file.name
    );

    // Send the file to the backend server
    const backendResponse = await fetch(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/db-services/upload`,
      {
        method: 'POST',
        body: backendFormData,
        headers: {
          // You might need to include headers like authorization if needed
        },
      }
    );

    if (!backendResponse.ok) {
      //   throw new Error(`Backend upload failed: ${backendResponse.status}`);
      return new Response(
        JSON.stringify({ status: 'fail', data: backendResponse.statusText }),
        {
          status: backendResponse.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const responseData = await backendResponse.text();

    return new Response(
      JSON.stringify({ status: 'success', data: responseData }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    return new Response(JSON.stringify({ status: 'fail', data: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
