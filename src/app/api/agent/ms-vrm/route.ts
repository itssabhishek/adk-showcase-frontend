export const runtime = 'edge';

export async function GET(request: Request) {
  const apiUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/vrm`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BACKEND_API_ADMIN_SECRET}`,
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
    console.error('error fetching vrms' + error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable no-undef */

// export const runtime = 'edge';user_custom_uploads

// import { NextResponse } from 'next/server';

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);

//   // If the user calls /api/agent/ms-vrm with ?path=..., we do the “proxy” logic
//   const path = searchParams.get('path');
//   if (path) {
//     // 1) For ?path=... => return binary
//     if (path.includes('..')) {
//       return new NextResponse('Invalid path', { status: 400 });
//     }

//     try {
//       const response = await fetch(path);
//       if (!response.ok) {
//         return new NextResponse('Resource not found', {
//           status: response.status,
//         });
//       }

//       const contentType =
//         response.headers.get('content-type') || 'application/octet-stream';
//       const arrayBuffer = await response.arrayBuffer();

//       return new NextResponse(arrayBuffer, {
//         headers: {
//           'Content-Type': contentType,
//           'Cross-Origin-Resource-Policy': 'same-origin',
//           'Cross-Origin-Embedder-Policy': 'require-corp',
//           'Access-Control-Allow-Origin': '*',
//           'Cache-Control': 'public, max-age=3600, immutable',
//         },
//       });
//     } catch (error) {
//       console.error('Error proxying ms-vrm:', error);
//       return new NextResponse('Internal Server Error', { status: 500 });
//     }
//   }

//   // 2) Otherwise, no “path” => original JSON logic
//   try {
//     const apiUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/vrm`;
//     const response = await fetch(apiUrl, {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' },
//     });
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const data = await response.json();
//     return NextResponse.json({ status: 'success', data });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
