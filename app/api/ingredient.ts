import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();
    
    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json({ error: 'Ingredients not provided or invalid format' }, { status: 400 });
    }

    const response = {
      message: "성공",
      data: ingredients
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
