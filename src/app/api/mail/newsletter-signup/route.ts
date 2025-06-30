import CryptoJS from 'crypto-js';

export const runtime = 'edge';

export async function POST(request: Request): Promise<Response> {
  const { email, name } = await request.json();
  try {
    const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const DATACENTER = process.env.MAILCHIMP_API_SERVER;

    // Adding tag to user
    const hashedEmail = CryptoJS.MD5(email).toString();
    const response = await fetch(
      `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members/${hashedEmail}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `apikey ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          full_name: name,
          status_if_new: 'subscribed',
          tags: ['Mailing List'],
        }),
      }
    );

    const responseData = await response.json();

    if (response.ok) {
      // Successfully added the member
      return new Response(JSON.stringify(response), { status: 200 });
    } else {
      // Handle responses other than 2xx
      return new Response(JSON.stringify(responseData), {
        status: responseData.status,
      });
    }
  } catch (error) {
    console.error('error:', error);
    return new Response(JSON.stringify(error), { status: 500 });
  }
}
