/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { headers } from 'next/headers';

export const runtime = 'edge';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function GET(request: Request) {
  const apiUrl = `${process.env.AGENT_BACKEND_API_BASE_URL}/agent`;

  try {
    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        ...JSON_HEADERS,
        Authorization: `Bearer ${process.env.BACKEND_API_ADMIN_SECRET}`,
      },
    });

    // parse the body even if !ok
    const payload = await resp.json();
    if (!resp.ok) {
      // forward the backend’s message or error field
      const msg = payload.message ?? payload.error ?? `HTTP ${resp.status}`;
      return new Response(JSON.stringify({ status: 'fail', message: msg }), {
        status: resp.status,
        headers: JSON_HEADERS,
      });
    }

    // success
    return new Response(JSON.stringify({ status: 'success', data: payload }), {
      status: 200,
      headers: JSON_HEADERS,
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ status: 'fail', message: e.message || 'Unknown error' }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function POST(req: Request): Promise<Response> {
  const authHeader = headers().get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ status: 'fail', message: 'Invalid JSON body' }),
      { status: 400, headers: JSON_HEADERS }
    );
  }

  try {
    const axiosRes = await axios.post(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/agent`,
      body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return new Response(
      JSON.stringify({ status: 'success', data: axiosRes.data }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (e: any) {
    // If we got a response from the backend, forward its status & message
    if (e.response) {
      const statusCode = e.response.status;
      const data = e.response.data || {};
      const message = data.error ?? data.message ?? data.error ?? e.message;
      return new Response(JSON.stringify({ status: 'fail', message }), {
        status: statusCode,
        headers: JSON_HEADERS,
      });
    }

    // Network / unexpected
    return new Response(
      JSON.stringify({
        status: 'fail',
        message: e?.response?.data?.message || e.message || 'Unknown error',
      }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
