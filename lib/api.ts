// lib/api.ts
export async function fetchRecipesApiCall() {
    console.log("fetchRecipesApiCall called");
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/recipe/`, { cache: "no-store" });

    console.log(res);
    return res.json();
}
