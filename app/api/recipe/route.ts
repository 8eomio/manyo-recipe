// app/api/recipes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchRecipes, addRecipe } from "@/data/firestore";

export async function GET(request: NextRequest) {
    const fetchedRecipes = await fetchRecipes();
    const response = {
        message: "레시피 가져오기",
        data: fetchedRecipes
    };
    return NextResponse.json(response, { status: 200 });
}

export async function POST(request: NextRequest) {
    const recipe = await request.json();
    const addedRecipe = await addRecipe(recipe);
    const response = {
        message: "레시피 추가 성공",
        data: addedRecipe
    };
    return NextResponse.json(response, { status: 201 });
}
