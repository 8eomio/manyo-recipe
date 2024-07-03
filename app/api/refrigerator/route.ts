import { NextRequest, NextResponse } from "next/server";
import { fetchIngredients, addIngredients } from "@/data/firestore";

export async function GET(request: NextRequest) {
  try {
    const fetchedIngredients = await fetchIngredients();
    console.log("test");
    const response = {
      message: "재료 가져오기",
      data: fetchedIngredients
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json({ message: "Error fetching ingredients" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ingredient, userid } = await request.json();
    console.log("test post", userid);
    const addedIngredients = await addIngredients({ ingredient, userid });
    const response = {
      message: "성공",
      data: addedIngredients
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error adding ingredient:", error);
    return NextResponse.json({ message: "Error adding ingredient" }, { status: 500 });
  }
}
