// lib/api.ts
export async function fetchRecipesApiCall() {
    console.log("fetchRecipesApiCall called");
    const res = await fetch("http://localhost:3000/api/recipe/", { cache: "no-store" });

    console.log(res);
    return res.json();
}
