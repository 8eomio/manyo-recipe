// pages/api/refrigerator/[slug].ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAIngredient, deleteAIngredient } from "@/data/firestore";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
    const fetchedIngredient = await fetchAIngredient(params.slug);
    
    if (!fetchedIngredient) {
        return NextResponse.json({ message: "재료를 찾을 수 없습니다." }, { status: 204 });
    }
    
    const response = {
        message: "데이터베이스로부터 재료 가져오기 성공",
        data: fetchedIngredient,
    };
    
    console.log(response);
    return NextResponse.json(response, { status: 200 });
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
    const deletedIngredient = await deleteAIngredient(params.slug);
    
    if (!deletedIngredient) {
        return NextResponse.json({ message: "삭제할 재료를 찾을 수 없습니다." }, { status: 204 });
    }
    
    const response = {
        message: "삭제 성공",
        data: deletedIngredient,
    };
    
    console.log(response.message);
    return NextResponse.json(response, { status: 200 });
}
