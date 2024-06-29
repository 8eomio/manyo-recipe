import type { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

export async function POST(request: NextRequest) {

    try {
        const { model, messages, temperature, max_tokens } = await request.json();

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            temperature,
            max_tokens,
        });

        return NextResponse.json({ choices: response.choices });
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return NextResponse.json({ status: 500 });
    }
}

