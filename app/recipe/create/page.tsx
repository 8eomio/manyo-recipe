"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addRecipe, uploadImage } from "@/data/firestore"; // Ensure to import from the correct path
import { recipe } from "@/types";

export default function CreateRecipePage() {
    const [newRecipe, setNewRecipe] = useState<Partial<recipe>>({
        title: '',
        required_ingredients: '',
        difficulty: '',
        comments: '',
        dish_name: '',
        time: 0,
        seasoning: '',
        optional_ingredients: '',
        author: '',
        all_ingredients: '',
        cooking_steps: [],
        cooking_step_images: [],
        utensils: '',
        views: 0
    });
    const [steps, setSteps] = useState<{ step: string; image: File | null }[]>([{ step: '', image: null }]);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewRecipe((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleStepChange = (index: number, e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedSteps = [...steps];
        if (name === "step") {
            updatedSteps[index] = { ...updatedSteps[index], step: value };
        } else if (e.target.files) {
            updatedSteps[index] = { ...updatedSteps[index], image: e.target.files[0] };
        }
        setSteps(updatedSteps);
    };

    const addStep = () => {
        setSteps([...steps, { step: '', image: null }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const imageUrls = await Promise.all(steps.map(async (step) => {
                if (step.image) {
                    const url = await uploadImage(step.image);
                    return url;
                }
                return '';
            }));
            const recipeData = {
                ...newRecipe,
                cooking_steps: steps.map(step => step.step),
                cooking_step_images: imageUrls
            } as recipe;
            await addRecipe(recipeData);
            router.push('/recipe'); // Navigate back to the recipes page after adding the recipe
        } catch (error) {
            console.error("Error adding recipe:", error);
        }
    };

    return (
        <div className="flex flex-col space-y-4 p-8">
            <h1 className="text-2xl font-bold">새 레시피 만들기</h1>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <input
                    type="text"
                    name="title"
                    placeholder="제목"
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    name="required_ingredients"
                    placeholder="꼭 있어야 하는 재료"
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    name="difficulty"
                    placeholder="난이도"
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    name="comments"
                    placeholder="댓글"
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    name="dish_name"
                    placeholder="메뉴명"
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    type="number"
                    name="time"
                    placeholder="시간(분)"
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    name="seasoning"
                    placeholder="양념장"
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    name="optional_ingredients"
                    placeholder="없어도 되는 재료"
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    name="author"
                    placeholder="작성자명"
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    name="all_ingredients"
                    placeholder="전체 재료"
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                {steps.map((step, index) => (
                    <div key={index} className="flex flex-col space-y-2">
                        <textarea
                            name="step"
                            placeholder={`조리 과정 ${index + 1}`}
                            value={step.step}
                            onChange={(e) => handleStepChange(index, e)}
                            className="p-2 border border-gray-300 rounded"
                        />
                        <input
                            type="file"
                            onChange={(e) => handleStepChange(index, e)}
                            className="p-2 border border-gray-300 rounded"
                        />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addStep}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    +
                </button>
                <input
                    type="text"
                    name="utensils"
                    placeholder="조리 도구"
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    type="number"
                    name="views"
                    placeholder="조회수"
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    레시피 추가
                </button>
            </form>
        </div>
    );
}
