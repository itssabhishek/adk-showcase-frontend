export const runtime = 'edge';

export async function POST(request: Request): Promise<Response> {
  const { email } = await request.json();
  console.log('email:', email);
  try {
    const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const DATACENTER = process.env.MAILCHIMP_API_SERVER;

    const response = await fetch(
      `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `apikey ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
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
