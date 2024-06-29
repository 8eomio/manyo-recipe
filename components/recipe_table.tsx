"use client";
import { useEffect, useState } from 'react';
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { recipe } from "@/types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faUser, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

const RecipeTable = ({ recipes }: { recipes: recipe[] }) => {
    const router = useRouter();
    const [filterId, setFilterId] = useState('');

    const deleteRecipeHandler = async (id: string) => {
        await fetch(`http://localhost:3000/api/recipes/${id}`, {
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
            {recipes && recipes.filter((recipe) => recipe.userid.toString() === filterId).map((recipe) => (
                <div key={recipe.id} style={cardStyle}>
                    <h2 style={titleStyle}>{recipe.title}</h2>
                    {recipe.main_img && (
                        <div style={imageContainerStyle}>
                            <img
                                src={recipe.main_img}
                                alt={`Main image of ${recipe.dish_name}`}
                                style={mainImageStyle}
                                onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/150';
                                    e.currentTarget.alt = '이미지 로드 실패';
                                }}
                            />
                        </div>
                    )}
                    <div style={cardHeaderStyle}>
                        <h3 style={dishNameStyle}>{recipe.dish_name}</h3>
                        <div style={detailsContainerStyle}>
                            <div style={detailItemStyle}>
                                <FontAwesomeIcon icon={faUser as IconProp} />
                                <span style={detailTextStyle}>{recipe.author}</span>
                            </div>
                            <div style={detailItemStyle}>
                                <FontAwesomeIcon icon={faClock as IconProp} />
                                <span style={detailTextStyle}>{recipe.time} 분</span>
                            </div>
                            <div style={detailItemStyle}>
                                <FontAwesomeIcon icon={faTachometerAlt as IconProp} />
                                <span style={detailTextStyle}>{recipe.difficulty}</span>
                            </div>
                        </div>
                        {Array.isArray(recipe.all_ingredients) && (
                            <div style={ingredientsContainerStyle}>
                                <strong style={{ marginBottom: '8px' }}>[재료]:</strong>
                                {recipe.all_ingredients.map((ingredient, index) => {
                                    const [name, quantity] = ingredient.split(' ', 2);
                                    return (
                                        <div key={index} style={ingredientStyle}>
                                            <span style={ingredientNameStyle}>{name}</span>
                                            <span style={ingredientSeparatorStyle}></span>
                                            <span style={ingredientQuantityStyle}>{quantity}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {recipe.seasoning && (
                            <div style={ingredientsContainerStyle}>
                                <strong style={{ marginBottom: '8px' }}>[양념장]:</strong>
                                <div style={ingredientStyle}>
                                    <span style={ingredientQuantityStyle}>{recipe.seasoning}</span>
                                </div>
                            </div>
                        )}
                        {recipe.optional_ingredients && (
                            <div style={ingredientsContainerStyle}>
                                <strong style={{ marginBottom: '8px' }}>[없어도 되는 재료]:</strong>
                                <div style={ingredientStyle}>
                                    <span style={ingredientQuantityStyle}>{recipe.optional_ingredients}</span>
                                </div>
                            </div>
                        )}
                        {recipe.utensils && (
                            <div style={ingredientsContainerStyle}>
                                <strong style={{ marginBottom: '8px' }}>[조리 도구]:</strong>
                                <div style={ingredientStyle}>
                                    <span style={ingredientQuantityStyle}>{recipe.utensils}</span>
                                </div>
                            </div>
                        )}
                        {recipe.views && (
                            <div style={ingredientsContainerStyle}>
                                <strong style={{ marginBottom: '8px' }}>[조회수]:</strong>
                                <div style={ingredientStyle}>
                                    <span style={ingredientQuantityStyle}>{recipe.views}</span>
                                </div>
                            </div>
                        )}
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

const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '2em',
    marginBottom: '16px',
};

const cardHeaderStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderBottom: '1px solid #333',
    paddingBottom: '8px',
    marginBottom: '8px'
};

const dishNameStyle: React.CSSProperties = {
    textAlign: 'center' as 'center',
    fontWeight: 'bold',
    fontSize: '1.5em',
    marginTop: '16px'
};

const cardContentStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '8px',
};

const rowStyle: React.CSSProperties = {
    display: 'contents',
};

const ingredientListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '8px',
    textAlign: 'left',
};

const ingredientStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
    padding: '4px',
    borderBottom: '1px solid #444',
};

const ingredientNameStyle: React.CSSProperties = {
    flex: '1 1 auto',
    textAlign: 'left',
    whiteSpace: 'nowrap',
};

const ingredientSeparatorStyle: React.CSSProperties = {
    flex: '1 1 auto',
    borderBottom: '1px dashed #fff',
    margin: '0 8px',
};

const ingredientQuantityStyle: React.CSSProperties = {
    flex: '0 0 auto',
    textAlign: 'right',
    whiteSpace: 'nowrap',
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
    justifyContent: 'center',
    marginTop: '8px'
};

const imageStyle: React.CSSProperties = {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px'
};

const mainImageStyle: React.CSSProperties = {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    marginTop: '8px'
};

const detailsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    width: '100%',
};

const detailItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
};

const detailTextStyle: React.CSSProperties = {
    marginLeft: '8px',
};

const ingredientsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '8px',
    marginLeft: '0',
    textAlign: 'left',
    width: '100%',
};

export default RecipeTable;
