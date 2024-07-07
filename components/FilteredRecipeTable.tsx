"use client";
import { useEffect, useState } from 'react';
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { recipe } from "@/types";

const FilteredRecipeTable = ({ recipes, searchTerm }: { recipes: recipe[], searchTerm: string }) => {
    const router = useRouter();
    const [filterId, setFilterId] = useState('');

    const deleteRecipeHandler = async (id: string) => {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/recipes/${id}`, {
            method: "DELETE",
            cache: 'no-store',
        });
        router.refresh();
        console.log("레시피 삭제 완료!");
    };

    useEffect(() => {
        const storedFilterId = localStorage.getItem('filterId');
        if (storedFilterId) {
            setFilterId(storedFilterId);
        }
    }, []);

    return (
        <div style={containerStyle}>
            {recipes && recipes.filter((recipe) => recipe.dish_name.toLowerCase().includes(searchTerm.toLowerCase())).map((recipe) => (
                <div key={recipe.id} style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <h3 style={dishNameStyle}>{recipe.dish_name}</h3>
                    </div>
                    <div style={cardContentStyle}>
                        <div style={rowStyle}><strong>게시글:</strong> <span>{recipe.title}</span></div>
                        <div style={rowStyle}><strong>작성자명:</strong> <span>{recipe.author}</span></div>
                        <div style={rowStyle}><strong>난이도:</strong> <span>{recipe.difficulty}</span></div>
                        <div style={rowStyle}><strong>시간(분):</strong> <span>{recipe.time}</span></div>
                        <div style={rowStyle}><strong>댓글:</strong> <span>{recipe.comments}</span></div>
                        <div style={rowStyle}><strong>꼭 있어야 하는 재료:</strong> <span>{recipe.required_ingredients}</span></div>
                        <div style={rowStyle}><strong>양념장:</strong> <span>{recipe.seasoning}</span></div>
                        <div style={rowStyle}><strong>없어도 되는 재료:</strong> <span>{recipe.optional_ingredients}</span></div>
                        <div style={rowStyle}><strong>전체 재료:</strong> <span>{recipe.all_ingredients.join(', ')}</span></div>
                        <div style={rowStyle}><strong>조리 도구:</strong> <span>{recipe.utensils}</span></div>
                       
                    </div>
                    {recipe.cooking_steps.map((step, index) => (
                        <div key={index} style={stepCardStyle}>
                            <div style={stepStyle}>
                                <strong>조리 과정 {index + 1}:</strong>
                                <p>{step}</p>
                            </div>
                            <div style={imageContainerStyle}>
                                {recipe.cooking_step_images[index] && (
                                    <img
                                        src={recipe.cooking_step_images[index]}
                                        alt={`조리 과정 이미지 ${index + 1}`}
                                        style={imageStyle}
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://via.placeholder.com/150';
                                            e.currentTarget.alt = '이미지 로드 실패';
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                    <Button onClick={() => deleteRecipeHandler(recipe.id)} color="warning">레시피 삭제</Button>
                </div>
            ))}
        </div>
    );
};

const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: '#000',
    color: '#fff',
    padding: '16px'
};

const cardStyle: React.CSSProperties = {
    padding: '16px',
    border: '1px solid #333',
    borderRadius: '8px',
    background: '#111',
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
    marginBottom: '16px'
};

const cardHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: '1px solid #333',
    paddingBottom: '8px',
    marginBottom: '8px'
};

const dishNameStyle: React.CSSProperties = {
    textAlign: 'center' as 'center', // Type assertion to fix TypeScript error
    fontWeight: 'bold',
    fontSize: '1.5em'
};

const cardContentStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '8px',
};

const rowStyle: React.CSSProperties = {
    display: 'contents',
};

const stepCardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#222',
    padding: '16px',
    borderRadius: '8px',
    marginTop: '16px',
    gap: '8px'
};

const stepStyle: React.CSSProperties = {
    backgroundColor: '#333',
    padding: '8px',
    borderRadius: '8px'
};

const imageContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center'
};

const imageStyle: React.CSSProperties = {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px'
};

export default FilteredRecipeTable;
