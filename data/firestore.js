// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, getDocs, doc, setDoc, getDoc, Timestamp, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyDLIML92O7EEU7azdSh-tG6EBmnpPTOYxk",
  authDomain: "refrigpt.firebaseapp.com",
  projectId: "refrigpt",
  storageBucket: "refrigpt.appspot.com",
  messagingSenderId: "1038466103916",
  appId: "1:1038466103916:web:390323b2b1b8f38c72f649"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export async function uploadImage(file) {
    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
}
// Functions for Refrigerator collection
export async function fetchIngredients() {
    const querySnapshot = await getDocs(collection(db, "Refrigerator"));
    if (querySnapshot.empty) {
        console.log("no matching") 
        return [];
    }
    const fetchedIngredients = [];
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        const aIngredient = {
            id: doc.id,
            ingredient: doc.data()["ingredient"],
            usrid: doc.data()["usrid"],
            exp_date: doc.data()["exp_date"].toDate(), //.toLocaleTimeString('ko')
        }
        fetchedIngredients.push(aIngredient);
    });
    return fetchedIngredients;
} 
export async function addIngredients({ ingredient }) {
    const newIngredientRef = doc(collection(db, "Refrigerator"));
    const createdTimestamp = Timestamp.fromDate(new Date())
    const newIngredientData = {
    id: newIngredientRef.id,
    ingredient : ingredient,
    exp_date: createdTimestamp
    };
    await setDoc(newIngredientRef, newIngredientData);
    return newIngredientData;
}
export async function addRecipe(recipe) {
    const newRecipeRef = doc(collection(db, "Recipe"));
    const createdTimestamp = Timestamp.fromDate(new Date());
    const newRecipeData = {
        id: newRecipeRef.id,
        게시글: recipe.title,
        꼭있어야하는재료: recipe.required_ingredients,
        난이도: recipe.difficulty,
        댓글: recipe.comments,
        메뉴명: recipe.dish_name,
        시간: recipe.time,
        양념장: recipe.seasoning,
        없어도되는재료: recipe.optional_ingredients,
        작성자명: recipe.author,
        전체재료: recipe.all_ingredients,
        조리과정: recipe.cooking_steps.join(","),
        조리이미지: recipe.cooking_step_images.join(","),
        조리도구: recipe.utensils,
        조회수: recipe.views,
        created_at: createdTimestamp
    };
    await setDoc(newRecipeRef, newRecipeData);
    return newRecipeData;
}


export async function fetchAIngredient(id) {
    if (id == null) {
        return null;
    }
    const igrdocRef = doc(db, "Refrigerator", id);
    const igrdocSnap = await getDoc(igrdocRef);
    if (igrdocSnap.exists()) {
        console.log("Document data:", igrdocSnap.data());
        const fetchedIngredient = {
            id: igrdocSnap.id,
            ingredient: igrdocSnap.data()["ingredient"],
            exp_date: igrdocSnap.data()["exp_date"].toDate()
        }
        return fetchedIngredient;
    } else {
        console.log("No such document");
        return null;
    }
}

export async function deleteAIngredient(id) {
    const fetchedIngredient = await fetchAIngredient(id);
    if (fetchedIngredient == null) {
        return null;
    }
    await deleteDoc(doc(db, "Refrigerator", id));
    return fetchedIngredient;
}

// Functions for Recipe collection
export async function fetchRecipes() {
    const querySnapshot = await getDocs(collection(db, "Recipe"));
    if (querySnapshot.empty) {
        console.log("no matching recipes");
        return [];
    }
    const fetchedRecipes = [];
    querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        const aRecipe = {
            id: doc.id,
            title: doc.data()["게시글"],
            required_ingredients: doc.data()["꼭있어야하는재료"],
            difficulty: doc.data()["난이도"],
            comments: doc.data()["댓글"],
            dish_name: doc.data()["메뉴명"],
            time: doc.data()["시간"],
            seasoning: doc.data()["양념장"],
            optional_ingredients: doc.data()["없어도되는재료"],
            author: doc.data()["작성자명"],
            all_ingredients: doc.data()["전체재료"],
            cooking_steps: doc.data()["조리과정"] ? doc.data()["조리과정"].split(',').map(step => step.trim()) : [],
            cooking_step_images: doc.data()["조리이미지"] ? doc.data()["조리이미지"].split(',').map(url => url.trim()) : [],
            utensils: doc.data()["조리도구"],
            views: doc.data()["조회수"],
        };
        fetchedRecipes.push(aRecipe);
    });
    return fetchedRecipes;
}



export async function fetchARecipe(id) {
    if (id == null) {
        return null;
    }
    const recipeDocRef = doc(db, "Recipe", id);
    const recipeDocSnap = await getDoc(recipeDocRef);
    if (recipeDocSnap.exists()) {
        console.log("Document data:", recipeDocSnap.data());
        const fetchedRecipe = {
            id: recipeDocSnap.id,
            title: recipeDocSnap.data()["title"],
            required_ingredients: recipeDocSnap.data()["required_ingredients"],
            difficulty: recipeDocSnap.data()["difficulty"],
            comments: recipeDocSnap.data()["comments"],
            dish_name: recipeDocSnap.data()["dish_name"],
            time: recipeDocSnap.data()["time"],
            seasoning: recipeDocSnap.data()["seasoning"],
            optional_ingredients: recipeDocSnap.data()["optional_ingredients"],
            author: recipeDocSnap.data()["author"],
            all_ingredients: recipeDocSnap.data()["all_ingredients"],
            cooking_steps: doc.data()["cooking_steps"] || [],
            cooking_step_images : recipeDocSnap.data()["cooking_step_image"] || [],
            utensils: recipeDocSnap.data()["utensils"],
            views: recipeDocSnap.data()["views"],
        };
        return fetchedRecipe;
    } else {
        console.log("No such document");
        return null;
    }
}

export async function deleteARecipe(id) {
    const fetchedRecipe = await fetchARecipe(id);
    if (fetchedRecipe == null) {
        return null;
    }
    await deleteDoc(doc(db, "Recipe", id));
    return fetchedRecipe;
}
