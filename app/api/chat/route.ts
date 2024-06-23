import { type NextRequest, NextResponse } from 'next/server';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

export async function POST(request: NextRequest) {
    // if (req.method !== 'POST') {
    //     res.setHeader('Allow', ['POST']);
    //     res.status(405).end(`Method ${req.method} Not Allowed`);
    //     return;
    // }
    const { model, messages, temperature, max_tokens, type, prompt, n, size} =await request.json();
    
    if (type === "chatting") {
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages,
                temperature,
                max_tokens,
            });
           
            return NextResponse.json({ choices: response.choices });
        } catch (error) {
            console.error("OpenAI API Error:", error);
            return NextResponse.json({ error: error.message });
        }
    }
    else if (type === "chatting2") {
        try {
            const imageResponse = await openai.images.generate({
                prompt,
                n,
                size,
            });
            console.log("image", imageResponse);
            return NextResponse.json({ data: imageResponse });

        } catch (error) {
            console.error("OpenAI API Error:", error);
            return NextResponse.json({ error: error.message });
        }
    }
    else if (type === "translate") {
        try {
            const response = await openai.completions.create({
                model,
                prompt,
                max_tokens,
                temperature,
            });
            
            return NextResponse.json({ data: response.choices[0].text.trim() });

        } catch (error) {
            console.error("OpenAI API Error:", error);
            return NextResponse.json({ error: error.message });
        }
    }
}

