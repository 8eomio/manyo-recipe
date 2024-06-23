import { NextRequest, NextResponse } from "next/server";
import { addIngredients, fetchIngredients } from "@/data/firestore";

export async function GET(request: NextRequest) {
    const ingredients = await fetchIngredients();
    const response = {
        message: "재료 가져오기 성공",
        data: ingredients
    }
    return NextResponse.json(response, { status: 201 });
}

export async function POST(request: NextRequest) {
    const { ingredients } = await request.json();
    const addedIngredients = [];

    // Assuming ingredients is an array of strings
    for (const ingredient of ingredients) {
        const addedIngredient = await addIngredients({ ingredient });
        addedIngredients.push(addedIngredient);
    }

    const response = {
        message: "재료 추가 성공",
        data: addedIngredients
    }
    console.log(response);
    return NextResponse.json(response, { status: 201 });
}
