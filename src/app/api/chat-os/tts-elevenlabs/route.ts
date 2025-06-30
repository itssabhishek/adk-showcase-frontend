import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided for TTS' },
        { status: 400 }
      );
    }

    const elevenLabsKey = process.env.ELEVEN_LABS_API_KEY;
    if (!elevenLabsKey) {
      return NextResponse.json(
        { error: 'Missing ElevenLabs API key on the server' },
        { status: 500 }
      );
    }

    // Replace with your own voice ID
    const voiceId = 'EXAVITQu4vr4xnSDxMaL';

    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
        }),
      }
    );

    if (!elevenRes.ok) {
      const errorText = await elevenRes.text();
      return NextResponse.json(
        { error: 'ElevenLabs TTS Error', details: errorText },
        { status: elevenRes.status }
      );
    }

    const audioArrayBuffer = await elevenRes.arrayBuffer();
    const audioBase64 = Buffer.from(audioArrayBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      audioBase64,
    });
  } catch (error) {
    console.error('Error in /api/chat-os/tts:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
