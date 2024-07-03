// app/api/recipe/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchARecipe, deleteARecipe } from '@/data/firestore';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
    const { slug } = params;
    const fetchedRecipe = await fetchARecipe(slug);

    if (!fetchedRecipe) {
        return NextResponse.json({ message: '레시피를 찾을 수 없습니다.' }, { status: 204 });
    }

    const response = {
        message: '데이터베이스로부터 레시피 가져오기 성공',
        data: fetchedRecipe,
    };
    console.log(response);
    return NextResponse.json(response, { status: 200 });
}

export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
    const { slug } = params;
    const deletedRecipe = await deleteARecipe(slug);

    if (!deletedRecipe) {
        return NextResponse.json({ message: '삭제할 레시피를 찾을 수 없습니다.' }, { status: 204 });
    }

    const response = {
        message: '삭제 성공',
        data: deletedRecipe,
    };

    console.log(response.message);
    return NextResponse.json(response, { status: 200 });
}
