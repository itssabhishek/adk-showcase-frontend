export const runtime = 'edge';

export async function GET(request: Request) {
  const apiUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/animation`;

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
