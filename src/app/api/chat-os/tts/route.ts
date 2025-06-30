/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { text, model, voice, instructions } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided for TTS' },
        { status: 400 }
      );
    }

    // TTS CALL
    const responseData = await axios.post(
      `${process.env.AGENT_BACKEND_API_BASE_URL}/user/tts`,
      {
        text,
        model,
        voice,
        instructions,
      }
      // {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // }
    );
    return NextResponse.json({
      success: responseData.data?.success,
      audioBase64: responseData.data?.audioBase64,
    });

    // const openAiApiKey = process.env.OPENAI_API_KEY;
    // if (!openAiApiKey) {
    //   return NextResponse.json(
    //     { error: 'Missing server-side OPENAI_API_KEY' },
    //     { status: 500 }
    //   );
    // }

    // const usedModel = model || 'gpt-4o-mini-tts';
    // const usedVoice = voice || 'echo';
    // const usedInstructions = instructions || 'Speak in a neutral tone.';

    // const openai = new OpenAI({
    //   apiKey: openAiApiKey,
    //   dangerouslyAllowBrowser: false,
    // });

    // const response = await openai.audio.speech.create({
    //   model: usedModel,
    //   voice: usedVoice,
    //   input: text,
    //   instructions: usedInstructions,
    //   response_format: 'mp3',
    // });

    // const arrayBuffer = await response.arrayBuffer();
    // const audioBase64 = Buffer.from(arrayBuffer).toString('base64');

    // return NextResponse.json({
    //   success: true,
    //   audioBase64,
    // });
  } catch (error: any) {
    console.error('Error in /api/chat-os/tts:', error.message);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
