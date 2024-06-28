import type { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

export async function POST(request: NextRequest) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    try {
        const { model, messages, temperature, max_tokens } = req.body;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            temperature,
            max_tokens,
        });

        res.status(200).json({ choices: response.choices });
    } catch (error) {
        console.error("OpenAI API Error:", error);
        res.status(500).json({ error: error.message });
    }
}

