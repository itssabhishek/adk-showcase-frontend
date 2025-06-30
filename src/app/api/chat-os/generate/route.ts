import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'No messages array provided in request body' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing server-side OpenAI API key' },
        { status: 500 }
      );
    }

    const openAiRes = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          // model: 'nousresearch/hermes-3-llama-3.1-405b',
          messages: messages,
        }),
      }
    );

    if (!openAiRes.ok) {
      const errText = await openAiRes.text();
      return NextResponse.json(
        { error: 'OpenAI API Error', details: errText },
        { status: openAiRes.status }
      );
    }

    const aiJson = await openAiRes.json();
    const agentText = aiJson?.choices?.[0]?.message?.content || '(No response)';

    // We'll pass the entire openAiJson back, but let's keep the agentText for convenience
    return NextResponse.json({
      success: true,
      choices: aiJson?.choices,
    });
  } catch (error) {
    console.error('Error in /api/chat-os/generate:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
