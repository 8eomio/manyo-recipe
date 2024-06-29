import { NextRequest, NextResponse } from "next/server";
import dummyigrd from '@/data/dummy.json'
import { fetchIngredients, addIngredients} from "@/data/firestore"
export async function GET(request: NextRequest) {
    const fetchedIngredients = await fetchIngredients();
    console.log("test")
    const response = {
        message: "재료 가져오기",
        data: fetchedIngredients
    }   
    return NextResponse.json(response, {status: 201});
  }

export async function POST(request: NextRequest) {
    const { ingredient, userid } = await request.json();
    console.log("test post", userid);
    const addedIngredients = await addIngredients({ingredient, userid});
    const response = {
        message: "성공",
        data: addedIngredients
    }
    return Response.json(response, {status: 201});
  }