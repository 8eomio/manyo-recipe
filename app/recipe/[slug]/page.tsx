// app/recipe/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { title } from "@/components/primitives";
import FilteredRecipeTable from "@/components/FilteredRecipeTable"; // Ensure the correct path
import { fetchRecipes } from "@/data/firestore"; // Ensure to import from the correct path
import { recipe } from "@/types";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function RecipePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [recipes, setRecipes] = useState<recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedSearchTerm = localStorage.getItem('searchTerm');
        if (storedSearchTerm) {
            setSearchTerm(storedSearchTerm.toLowerCase());
        }
    }, []);

    useEffect(() => {
        const fetchRecipesData = async () => {
            try {
                const fetchedRecipes = await fetchRecipes();
                setRecipes(fetchedRecipes);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchRecipesData();
    }, []);
    console.log("searchterm", searchTerm);
    const filteredRecipes = recipes.filter(recipe =>
        recipe.dish_name?.toLowerCase().includes(searchTerm)
    );

    return (
        <div className="flex flex-col space-y-8">
            <div className="relative flex items-center justify-center">
                <h1 className={title()}>레시피</h1>
                <div className="absolute right-0">
                    <Link href="/recipe/create">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded">
                            레시피 등록
                        </button>
                    </Link>
                </div>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <FilteredRecipeTable recipes={filteredRecipes} searchTerm={searchTerm} />
            )}
        </div>
    );
}
