// app/recipes/page.tsx
import { title } from "@/components/primitives";
import RecipeTable from "@/components/recipe_table";
import { fetchRecipes } from "@/data/firestore"; // Ensure to import from the correct path
import { recipe } from "@/types";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RecipePage() {
    let recipes: recipe[] = [];
    try {
        recipes = await fetchRecipes();
        console.log("Pages Recipes:", recipes);
    } catch (error) {
        console.error(error);
    }

    return (
        <div className="flex flex-col space-y-8">
            <div className="relative flex items-center justify-center">
                <h1 className={title()}>레시피</h1>
                <div className="absolute right-0">
                    <Link href="recipe/create">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded">
                            레시피 등록
                        </button>
                    </Link>
                </div>
            </div>
            <RecipeTable recipes={recipes} />
        </div>
    );
}
