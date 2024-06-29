import { NextRequest, NextResponse } from "next/server";
import { addIngredients, fetchIngredients } from "@/data/firestore";

export async function GET(request: NextRequest) {
    const ingredients = await fetchIngredients();
    const response = {
        message: "재료 가져오기 성공",
        data: ingredients
    };
    return NextResponse.json(response, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        const { ingredients, userid } = await request.json();
        const addedIngredients = [];

        // Assuming ingredients is an array of strings
        for (const ingredient of ingredients) {
            const addedIngredient = await addIngredients({ ingredient, userid });
            addedIngredients.push(addedIngredient);
        }

        const response = {
            message: "재료 추가 성공",
            data: addedIngredients
        };
        console.log(response);
        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error("Error adding ingredients:", error);

        let errorMessage = "Unknown error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json({ message: "재료 추가 실패", error: errorMessage }, { status: 500 });
    }
}
