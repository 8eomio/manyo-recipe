'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/Chat.module.css';
import OpenAI from 'openai';
import Image from 'next/image';


const openai = new OpenAI({ apiKey:`${process.env.OPENAI_API_KEY}`,dangerouslyAllowBrowser: true });

interface ChatLog {
    type: 'user' | 'bot' | 'button';
    message: string;
    imageUrl?: string;
}
interface Recommendation {
    text: string;
    id: string;
    type: 'user' | 'bot';
    cookingTime?: string;
    difficulty?: string;
    ingredients?: string[];
    imageUrl?: string;
}
interface RefriItem {
    id: string;
    usrid: string;
    ingredient: string;
    exp_date: string;
}

async function fetchRefriApiCall() {
  console.log("fetchRefriApiCall called");
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/refrigerator`, { cache: "no-store" });
  return res.json();
}
const Chat = () => {
    const [userMsg, setUserMsg] = useState<string>("");
    const [chatLog, setChatLog] = useState<ChatLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<number>(1);
    const [context, setContext] = useState<any>({});
    const [waitingForInput, setWaitingForInput] = useState<boolean>(false);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isRecommending, setIsRecommending] = useState<boolean>(false);
    const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
    const [showBackOptions, setShowBackOptions] = useState<boolean>(false);
    const [showIngredientsSelection, setShowIngredientsSelection] = useState<boolean>(false);
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [recipes, setRecipes] = useState<any[]>([]); // JSON 파일 데이터를 저장할 상태
    const [ingredients, setIngredients] = useState<RefriItem[]>([]);
    const [filterId, setFilterId] = useState('');
    useEffect(() => {
        const fetchIngredients = async () => {
            const response = await fetchRefriApiCall();
            setIngredients(response.data ?? []);
        };
        fetchIngredients();
    }, []);

    useEffect(() => {
        const storedFilterId = localStorage.getItem('filterId');
        if (storedFilterId) {
            setFilterId(storedFilterId);
        }
    }, []);
    useEffect(() => {
        if (step === 1) {
            const botMessage = getBotMessage(1);
            setChatLog([{ type: 'bot', message: botMessage }]);
    
            // 2초 후 자동으로 NO 버튼을 누른 것처럼 동작
            setTimeout(() => {
                const newChatLog = chatLog.concat({ type: 'bot', message: botMessage });
                const botMessageNext = getBotMessage(5);
                const updatedChatLog = newChatLog.concat({ type: 'bot', message: botMessageNext });
                setChatLog(updatedChatLog);
                setStep(5);
            }, 2000);
        }

        // JSON 파일에서 데이터 불러오기
        const fetchRecipes = async () => {
            try {
                const response = await fetch('/recipes.json'); // public 폴더 내의 JSON 파일 경로
                const data = await response.json();
                setRecipes(data);

            } catch (error) {
                console.error("Error loading recipes data:", error);
            }
        };
        fetchRecipes();
    }, [step]);

    const handleSendMessage = async (message: string) => {
        console.log("handleSendMessage called with message:", message);
    
        if (step === 1 && selectedRecipe) {
            console.log("Step 1: Duplicate call detected, returning early");
            return;
        }
    
        const newChatLog = [...chatLog, { type: 'user', message }];
        setChatLog(newChatLog as ChatLog[]);
        setUserMsg('');
        setIsLoading(true);
    
        if (step === 1) {
            console.log("Step 1: User has selected a specific dish");
            setSelectedRecipe(message);
            await handleRecommendationClick(message);
        } else {
            const newContext = { ...context };
            switch (step) {
                case 2:
                    if (message && message.trim()) {
                        newContext.ingredients = message.split(',').map(item => item.trim());
                    }
                    break;
                case 3:
                    if (message && message.trim()) {
                        newContext.preferredCuisine = message.trim();
                    }
                    break;
                case 4:
                    if (message && message.trim()) {
                        newContext.additionalInfo = message.trim();
                    }
                    break;
            }
            setContext(newContext);
            console.log("Updated context:", newContext);

            //console.log(Object.keys(recipes[0]));
    
            if (step < 4) {
                const botMessage = getBotMessage(step + 1);
                const newBotChatLog = [...newChatLog, { type: 'bot', message: botMessage }];
                setChatLog(newBotChatLog as ChatLog[]);
                setStep(step + 1);
                setIsLoading(false);
                setWaitingForInput(true);
            } else {
                //console.log("Requesting recommendations with context:", newContext);
                let filteredRecipes = filterRecipesByIngredients(recipes, newContext.ingredients || [], selectedIngredients);
                //console.log("Filtered recipes before length check:", filteredRecipes);
                

    
                // if (filteredRecipes.length > 100 ) {
                //     filteredRecipes = filteredRecipes
                //         .map(recipe => ({
                //             ...recipe,
                //             matchCount: countMatchingIngredients(recipe.RCP_PARTS_DTLS.split(',').map(i => i.trim()), selectedIngredients)
                //         }))
                //         .sort((a, b) => b.matchCount - a.matchCount)
                //         .slice(0, 50);
                //     console.log("Filtered recipes after length check and sorting:", filteredRecipes);
                // }

                if (filteredRecipes.length > 100) {
                    filteredRecipes = filteredRecipes
                        .map(recipe => {
                            const recipeIngredients = recipe.RCP_PARTS_DTLS.split(',').map((i:any) => i.trim());
                            const selectedIngredientsMatchCount = countMatchingIngredients(recipeIngredients, selectedIngredients|| []);
                            const newContextIngredientsMatchCount = countMatchingIngredients(recipeIngredients, newContext.ingredients || []);
                            return {
                                ...recipe,
                                matchCount: selectedIngredientsMatchCount + newContextIngredientsMatchCount
                            };
                        })
                        .sort((a, b) => b.matchCount - a.matchCount)
                        .slice(0, 50);
                    console.log("Filtered recipes after length check and sorting:", filteredRecipes);
                }

                console.log("Filtered recipes before length check:", filteredRecipes);

                const recommendations = await requestRecommendations(newContext, filteredRecipes, selectedIngredients);
                setRecommendations(recommendations as Recommendation[]);
                if (recommendations.length === 0) {
                    setChatLog([...newChatLog as ChatLog[], { type: 'bot', message: "추천된 메뉴가 없습니다. 요구사항이 복잡하거나 요구사항이 없는 경우에 추천이 어려울 수 있습니다. 처음 단계로 돌아가겠습니다." }]);
                    setStep(1);
                    setContext({});
                    setWaitingForInput(false);
                    setIsRecommending(false);
                    setSelectedRecipe(null);
                } else {
                    setChatLog([...newChatLog as ChatLog[], { type: 'bot', message: "추천된 메뉴는 다음과 같아요." }]);
                    setIsRecommending(true);
                }
                setIsLoading(false);
                setWaitingForInput(false);
            }
        }
    };

    const requestRecommendations = async (context: any, filteredRecipes: any[], fridgeIngredients: string[]) => {
        // console.log('context.additionalInfo:', context.additionalInfo);
        // console.log('context.preferredCuisine:', context.preferredCuisine);
        // console.log("1:", context.ingredients);
        //console.log("2:", recipes);
        //console.log(Object.keys(filteredRecipes[0]));

        const simplifiedRecipes = filteredRecipes.map(recipe => ({
            메뉴이름:recipe.RCP_NM,
            요리종류: recipe.RCP_PAT2,
            요리재료: recipe.RCP_PARTS_DTLS,
            조리방법: recipe.RCP_WAY2,
            중량: recipe.INFO_WGT,
        }));

        const response = await axios.post('/api/chat', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: "당신은 도움이 되는 어시스턴트입니다." },
                { role: 'user', content: `선호하는 음식종류는 (${context.preferredCuisine || '없음'})이고, 추가적으로 만들고 싶은 음식의 성격은 (${context.additionalInfo||'없음'})이야. 음식 재료로 (${fridgeIngredients|| '없음'|| selectedIngredients})을 최대한 활용하고싶어. 이를 참고해서 메뉴 5개 이상을 추천하되, 다음 음식 레시피를 참고해서 이 안에서 추천해줘: ${JSON.stringify(simplifiedRecipes)}. 최종적으로 나오는 형태는 메뉴들을 ','로 연결해서 리스트로 보여줘. 가장 적합한 메뉴 순서대로 정렬해서 보여줘. 예를 들면, output으로 김치라면, 부대찌개, ... 이런식으로 해. 메뉴 이름만 얘기하고, 다른 단어는 아무것도 보여주지마.` }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const recommendationsText = response.data.choices[0].message.content;
        console.log('Recommendations text:', recommendationsText);
    
        const recommendationNames = recommendationsText.split(',').map((name: any) => name.trim());

        const uniqueRecommendationNames = [...new Set(recommendationNames)];
    
        const recommendations = uniqueRecommendationNames.map((name, index) => {
            const recipe = recipes.find(r => r.RCP_NM === name);
            if (recipe) {
                console.log(`Recipe: ${name}, Image URL: ${recipe.ATT_FILE_NO_MAIN}`);
                return {
                    id: `recommendation-${index}`,
                    text: name,
                    type: recipe.RCP_PAT2 || '',
                    ingredients: recipe.RCP_PARTS_DTLS || '',
                    imageUrl: recipe.ATT_FILE_NO_MAIN || ''
                };
            } else {
                console.error(`Recipe not found for name: ${name}`);
                return null;
            }
        }).filter(rec => rec !== null);
        
        // 추천된 메뉴들을 냉장고 재료와 겹치는 순서로 정렬
        recommendations.sort((a, b) => {
            if (!a || !b) {
                return 0; // Handle null values as equal
            }
            const aFridgeMatchCount = countMatchingIngredients(a.ingredients.split(',').map((i:any) => i.trim()), fridgeIngredients);
            const bFridgeMatchCount = countMatchingIngredients(b.ingredients.split(',').map((i:any) => i.trim()), fridgeIngredients);
        
            const aContextIngredientsMatchCount = countMatchingIngredients(a.ingredients.split(',').map((i:any) => i.trim()), context.ingredients || []);
            const bContextIngredientsMatchCount = countMatchingIngredients(b.ingredients.split(',').map((i:any) => i.trim()), context.ingredients || []);
        
            const aTotalMatchCount = aFridgeMatchCount + aContextIngredientsMatchCount;
            const bTotalMatchCount = bFridgeMatchCount + bContextIngredientsMatchCount;
        
            return bTotalMatchCount - aTotalMatchCount; // 내림차순 정렬
        });
        
        return recommendations;
    };

    const countMatchingIngredients = (recipeIngredients: string[], fridgeIngredients: string[]) => {
        // console.log("Recipe Ingredients:", recipeIngredients);
        // console.log("Fridge Ingredients:", fridgeIngredients);
        return recipeIngredients.filter(ingredient => 
            fridgeIngredients.some(fridgeIngredient => ingredient.indexOf(fridgeIngredient) !== -1)
        ).length;
    };
    const filterRecipesByIngredients = (recipes: any[], ingredients: string[], fridgeIngredients: string[]) => {
        return recipes.filter(recipe => {
            if (!recipe.RCP_PARTS_DTLS) {
                console.log(`Recipe ${recipe.RCP_NM} has no parts details.`);
                return false;
            }
    
            const recipeIngredients = recipe.RCP_PARTS_DTLS.split(',').map((i:any) => i.trim());
            console.log(`Recipe: ${recipe.RCP_NM}, Ingredients: ${recipeIngredients}`);
    
            let includesFridgeIngredient = true; // 기본값을 true로 설정
            if (fridgeIngredients.length > 0) {
                includesFridgeIngredient = fridgeIngredients.some(ingredient =>
                    recipeIngredients.some((recipeIngredient:any) => recipeIngredient.includes(ingredient))
                );
            }
            
            // 입력된 재료 중 최소 하나라도 레시피 재료에 포함되어 있는지 확인
            const atLeastOneIngredientIncluded = ingredients.length === 0 || ingredients.some(ingredient =>
                recipeIngredients.some((recipeIngredient:any) => recipeIngredient.includes(ingredient))
            );
    
            console.log(`At least one ingredient included for ${recipe.RCP_NM}: ${atLeastOneIngredientIncluded}, Includes fridge ingredient: ${includesFridgeIngredient}`);
    
            return includesFridgeIngredient && atLeastOneIngredientIncluded;
        });
    };
    

    // const filterRecipesByIngredients = (recipes: any[], ingredients: string[], fridgeIngredients: string[]) => {
    //     return recipes.filter(recipe => {
    //         if (!recipe.RCP_PARTS_DTLS) {
    //             console.log(`Recipe ${recipe.RCP_NM} has no parts details.`);
    //             return false;
    //         }
    
    //         const recipeIngredients = recipe.RCP_PARTS_DTLS.split(',').map(i => i.trim());
    //         console.log(`Recipe: ${recipe.RCP_NM}, Ingredients: ${recipeIngredients}`);
    
    //         let includesFridgeIngredient = true; // 기본값을 true로 설정
    //         if (fridgeIngredients.length > 0) {
    //             includesFridgeIngredient = fridgeIngredients.some(ingredient =>
    //                 recipeIngredients.some(recipeIngredient => recipeIngredient.includes(ingredient))
    //             );
    //         }
            
    //         // 모든 입력된 재료가 레시피 재료에 포함되어 있는지 확인
    //         const allIngredientsIncluded = ingredients.length === 0 || ingredients.every(ingredient =>
    //             recipeIngredients.some(recipeIngredient => recipeIngredient.includes(ingredient))
    //         );
    
    //         console.log(`All ingredients included for ${recipe.RCP_NM}: ${allIngredientsIncluded}, Includes fridge ingredient: ${includesFridgeIngredient}`);
    
    //         return includesFridgeIngredient && allIngredientsIncluded;
    //     });
    // };


    const getBotMessage = (currentStep: number) => {
        if (isRecommending) {
            return "";
        }

        if (showIngredientsSelection) {
            return "냉장고에 있는 재료들 중에 넣고 싶은 재료들을 여러 개 선택하고 선택이 완료되면 완료 버튼을 눌러주세요. 최대한 반영해서 추천해드릴게요.";
        }

        switch (currentStep) {
            case 1:
                return "안녕하세요. 이자벨라에요~! 당신의 냉장고를 기반으로 취향에 맞는 음식을 추천해 드릴게요. 저와 함께 맛있는 요리를 만들어볼까요?";
            case 2:
                return "지금 내 냉장고에는 없지만 추가로 활용하고 싶은 재료가 있나요? 있으면 yes를 누르고 하단 입력창에 재료들을 입력해주세요. 재료들은 , 로 구분해서 넣어주세요. 최대한 반영해서 추천해드릴게요!";
            case 3:
                return "선호하는 음식 종류가 있나요? (ex. 한식, 양식, 일식 등) 있으면 yes를 누르고 하단 입력창에 입력해주세요.";
            case 4:
                return "혹시 추가적으로 고려해야할 사항이 있을까요? (ex. 간단히 만드는 음식, 파티 음식, 캠핑 음식, 다이어트 음식, 고춧가루가 안들어간 음식) 있으면 yes를 누르고 하단 입력창에 입력해주세요.";
            case 5:
                return "냉장고에 있는 재료들을 기반으로 추천해드릴까요?";
            default:
                return "";
        }
    };

    const handleAnotherRecommendationClick = async () => {
        console.log("handleAnotherRecommendationClick called");
        setIsLoading(true);
        const excludedRecommendations = recommendations.map(rec => rec.text).join(', ');
        const newContext = { ...context, exclude: excludedRecommendations };
        await requestRecommendations(newContext, chatLog, selectedIngredients);
    };
    const handleButtonClick = async (message: string) => {
        const newChatLog = [...chatLog, { type: 'user', message }];
        setChatLog(newChatLog as ChatLog[]);

        if (message === 'YES' && step === 1) {
            setWaitingForInput(true);
            setIsLoading(false);
        } else if (message === 'YES' && (step === 2 || step === 3)) { 
            setWaitingForInput(true);
            setIsLoading(false);
        } else if (message === 'YES' && step === 5) {
            setShowIngredientsSelection(true);
            const botMessage = "냉장고에 있는 재료들 중에 넣고 싶은 재료들을 여러 개 선택하고, 선택이 완료되면 완료 버튼을 눌러주세요. 최대한 반영해서 추천해드릴게요!";
            const updatedChatLog = [...newChatLog, { type: 'bot', message: botMessage }];
            setChatLog(updatedChatLog as ChatLog[]);
            setWaitingForInput(false);
        } else if (message === 'NO' && step === 1) {
            const botMessage = getBotMessage(5);
            const updatedChatLog = [...newChatLog, { type: 'bot', message: botMessage }];
            setChatLog(updatedChatLog as ChatLog[]);
            setStep(5);
        } else if (message === 'NO' && step === 5) {
            const botMessage = getBotMessage(2);
            const updatedChatLog = [...newChatLog, { type: 'bot', message: botMessage }];
            setChatLog(updatedChatLog as ChatLog[]);
            setStep(2);
            setWaitingForInput(false);
        } else if (message === 'NO' && step !== 4) {
            const botMessage = getBotMessage(step + 1);
            const updatedChatLog = [...newChatLog, { type: 'bot', message: botMessage }];
            setChatLog(updatedChatLog as ChatLog[]);
            setWaitingForInput(false);
            setStep(step + 1);
        } else if (message === 'YES' && step === 4) {
            setWaitingForInput(true);
        } else if (message === 'NO' && step === 4) {
            await handleSendMessage(userMsg);
        }
    };


    const handleRecommendationClick = async (message: string) => {
        console.log("handleRecommendationClick called with message:", message);
    
        if (selectedRecipe === message) {
            console.log("Duplicate recommendation click detected, returning early");
            return;
        }
    
        setSelectedRecipe(message);
        setIsLoading(true);
    
        const recipe = recipes.find(r => r.RCP_NM === message);
        if (recipe) {
            const recipeMessages = [
                recipe.RCP_PAT2 ? { type: 'bot', message: `<strong>요리 종류</strong><br>${recipe.RCP_PAT2}` } : null,
                recipe.RCP_PARTS_DTLS ? { type: 'bot', message: `<strong>재료</strong><br>${recipe.RCP_PARTS_DTLS}` } : null,
                recipe.RCP_WAY2 ? { type: 'bot', message: `<strong>조리 방법</strong><br>${recipe.RCP_WAY2}` } : null,
                recipe.INFO_WGT ? { type: 'bot', message: `<strong>중량</strong><br>${recipe.INFO_WGT}` } : null,
                recipe.INFO_ENG ? { type: 'bot', message: `<strong>열량</strong><br>${recipe.INFO_ENG}` } : null,
            ].filter(msg => msg !== null);
    
            const cookingSteps:any = [];
            for (let i = 1; i <= 20; i++) {
                const stepText = recipe[`MANUAL${String(i).padStart(2, '0')}`];
                const stepImage = recipe[`MANUAL_IMG${String(i).padStart(2, '0')}`];
                if (stepText) {
                    cookingSteps.push({
                        type: 'bot',
                        message: `<strong>조리 과정 ${i}</strong><br>${stepText}`,
                        imageUrl: stepImage || null
                    });
                }
            }
    
            console.log("Recipe Messages:", recipeMessages);
    
            setChatLog(prevChatLog => [
                ...prevChatLog,
                { type: 'bot', message: `${message}에 대한 정보를 보여드릴게요.` },
                ...recipeMessages.map(msg => {
                    if (!msg) return null;
                    const lines = msg.message.split('<br>');
                    return {
                        ...msg,
                        message: `<strong>${lines[0]}</strong>${lines[1] ? `<br>${lines[1]}` : ''}`
                    };
                }),
                ...cookingSteps,
                { type: 'bot', message: "레시피에 대해 궁금한 점이 있으신가요? 예: 신 김치를 사용해야 하나요? 김치를 얼마나 볶아야 하나요?" }
            ]);
    
            setWaitingForInput(true);
            setStep(6);
            setIsRecommending(false);
            setIsLoading(false); // 상태 업데이트를 통해 로딩 종료
        } else {
            setChatLog(prevChatLog => [
                ...prevChatLog,
                { type: 'bot', message: `${message}에 대한 정보를 찾을 수 없습니다.` }
            ]);
            setIsLoading(false); // 상태 업데이트를 통해 로딩 종료
        }
    };
    
    
    
    const translateToEnglish = async (text: string) => {
        try {
            const response = await openai.completions.create({
                model: "gpt-3.5-turbo-instruct",
                prompt: `Translate the following Korean text to English: ${text}`,
                max_tokens: 100,
                temperature: 0.5,
            });
            const translatedText = response.choices[0].text.trim();
            console.log("Translated text:", translatedText);
            return translatedText;
        } catch (error) {
            console.error("Error translating text:", error);
            return text;
        }
    };

    const handleQuestionSubmit = async (question: string) => {
        console.log("handleQuestionSubmit called with question:", question);
        setChatLog(prevChatLog => [...prevChatLog, { type: 'user', message: question }]);
        setUserMsg('');
        setIsLoading(true);
    
        const recipe = recipes.find(r => r.RCP_NM === selectedRecipe);
        let recipeDetails = "";
    
        if (recipe) {
            recipeDetails = `
                ${recipe.RCP_PAT2 ? `요리 종류: ${recipe.RCP_PAT2}` : ''}
                ${recipe.RCP_PARTS_DTLS ? `재료: ${recipe.RCP_PARTS_DTLS}` : ''}
                ${recipe.RCP_WAY2 ? `조리 방법: ${recipe.RCP_WAY2}` : ''}
                ${recipe.INFO_WGT ? `중량: ${recipe.INFO_WGT}` : ''}
                ${recipe.INFO_ENG ? `열량: ${recipe.INFO_ENG}` : ''}
            `.trim();
            
            // 조리 과정 추가
            for (let i = 1; i <= 20; i++) {
                const stepText = recipe[`MANUAL${String(i).padStart(2, '0')}`];
                const stepImage = recipe[`MANUAL_IMG${String(i).padStart(2, '0')}`];
                if (stepText) {
                    recipeDetails += `\n조리 과정 ${i}: ${stepText}`;
                    if (stepImage) {
                        recipeDetails += ` (이미지: ${stepImage})`;
                    }
                }
            }
        }
    
        try {
            const response = await axios.post('/api/chat', {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: "당신은 도움이 되는 어시스턴트입니다." },
                    { role: 'user', content: `메뉴: ${selectedRecipe}. 레시피 정보: ${recipeDetails}. 이 정보를 참고해서 다음 질문에 답해 주세요. 질문: ${question}.` },
                ],
                temperature: 1.0,
                max_tokens: 300,
            });
    
            console.log("API response:", response.data);
    
            if (response.data.choices && response.data.choices.length > 0) {
                const botMessage = response.data.choices[0].message.content;
                setChatLog(prevChatLog => [...prevChatLog, { type: 'bot', message: botMessage }]);
                setChatLog(prevChatLog => [...prevChatLog, { type: 'bot', message: "레시피에 대해 궁금한 점이 있으신가요? 예: 신 김치를 사용해야 하나요? 김치를 얼마나 볶아야 하나요?" }]);
                setWaitingForInput(true);
            } else {
                console.error("Unexpected API response format:", response.data);
                setChatLog(prevChatLog => [...prevChatLog, { type: 'bot', message: "API 응답을 처리하는 중 문제가 발생했습니다." }]);
            }
            setIsLoading(false);
        } catch (err) {
            console.error("Error sending message:", err);
            setChatLog(prevChatLog => [...prevChatLog, { type: 'bot', message: "메시지를 보내는 중 오류가 발생했습니다." }]);
            setIsLoading(false);
        }
    };
    

    const handleBackClick = () => {
        setShowBackOptions(true);
    };

    const handleRestartClick = () => {
        setStep(1);
        setShowBackOptions(false);
        setChatLog([]);
        setContext({});
        setRecommendations([]);
        setWaitingForInput(false);
        setIsRecommending(false);
        setSelectedRecipe(null);
    };

    const handleViewRecommendationsClick = () => {
        setStep(4);
        setShowBackOptions(false);
    };

    const handleIngredientClick = (ingredient: string) => {
        if (selectedIngredients.includes(ingredient)) {
            setSelectedIngredients(selectedIngredients.filter(item => item !== ingredient));
        } else {
            setSelectedIngredients([...selectedIngredients, ingredient]);
        }
        const newChatLog = [...chatLog, { type: 'user', message: ingredient }];
        setChatLog(newChatLog as ChatLog[]);
    };

    const handleIngredientsSubmit = () => {
        setContext({ ...context, optionalIngredients: selectedIngredients });
        console.log("Optional ingredients added to context:", selectedIngredients);
        setShowIngredientsSelection(false);
        const newStep = 2;
        const botMessage = "넣고 싶은 재료가 있나요? 있으면 yes를 누르고 하단 입력창에 재료들을 입력해주세요. 재료들은 , 로 구분해서 넣어주세요.";
        const newChatLog = [...chatLog, { type: 'bot', message: botMessage }];
        setChatLog(newChatLog as ChatLog[]);
        setStep(newStep);
        setWaitingForInput(false);
    };

    return (
<div className={styles.chatContainer}>
            <header className={styles.header}>
                요리요정 콩순이
                <Image src="/icon.png" alt="아이콘" width={40} height={40} className={styles.icon} />
            </header>
            <ul className={styles.feed}>
                {chatLog.map((chat, index) => (
                    <li key={index} className={`${styles.chat} ${chat.type === 'user' ? styles.user : styles.bot}`}>
                        {chat.type === 'bot' && (
                            <div className={styles.botProfile}>
                                <img src="/kong3.png" alt="콩순이" />
                                <span className={styles.botName}>콩순이</span>
                            </div>
                        )}
{/* <div className={styles.messageContainer}>
    {chat.message && chat.message.split('<br>').map((line, i) => (
        <p key={i} style={{ marginBottom: '5px' }}>
            {line.includes('조리 과정') 
                ? <strong>{line.split(' ')[0]} {line.split(' ')[1]}</strong>
                : line.includes('<strong>') 
                    ? <strong>{line.replace(/<strong>|<\/strong>/g, '')}</strong>
                    : line
            }
        </p>
    ))}
    {chat.imageUrl && <img src={chat.imageUrl} alt="Cooking Step" />}
</div> */}

<div className={styles.messageContainer}>
    {chat.message && <div dangerouslySetInnerHTML={{ __html: chat.message }} />}
    {chat.imageUrl && <img src={chat.imageUrl} alt="Cooking Step" />}
</div>


                    {chat.type === 'bot' && index === chatLog.length - 1 && !isLoading && !showIngredientsSelection && !['추천된 메뉴는 다음과 같아요.', '레시피에 대해 궁금한 점이 있으신가요? 예: 신 김치를 사용해야 하나요? 김치를 얼마나 볶아야 하나요?'].includes(chat.message)  && step !== 1 && (
                        <div className={styles.buttonContainer}>
                            <button className={styles.button} onClick={() => handleButtonClick('YES')}>YES</button>
                            <button className={styles.button} onClick={() => handleButtonClick('NO')}>NO</button>
                        </div>
                    )}
                </li>
            ))}
            {isLoading && (
                <li key={chatLog.length} className={styles.chat}>
                    Loading...
                </li>
            )}
        </ul>


            {!isLoading && waitingForInput && step <= 4 && !isRecommending && !showIngredientsSelection && (
                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="상세 내용을 입력하세요"
                        value={userMsg}
                        onChange={(e) => setUserMsg(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage(userMsg);
                                setWaitingForInput(false);
                            }
                        }}
                    />
                    <button className={styles.button} onClick={() => {
                        handleSendMessage(userMsg);
                        setWaitingForInput(false);
                    }}>Send</button>
                </div>
            )}
            {!isLoading && showIngredientsSelection && (
                <div className={styles.inputContainer}>
                     {ingredients
              .filter((ingredient) => ingredient.usrid.toString() === filterId).map((ingredient, index) => (
                        <button
                            key={index}
                            className={`${styles.button} ${selectedIngredients.includes(ingredient.ingredient) ? styles.selected : ''}`}
                            onClick={() => handleIngredientClick(ingredient.ingredient)}
                        >
                            {ingredient.ingredient}
                        </button>
                    ))}
                    <button className={styles.button} onClick={handleIngredientsSubmit}>완료</button>
                </div>
            )}
            {!isLoading && step === 4 && recommendations.length > 0 && (
                <div className={styles.carousel}>
                    <div className={styles.carouselInner}>
                        {recommendations.map((rec) => (
                            <div key={rec.id} className={styles.card} onClick={() => handleRecommendationClick(rec.text)} style={{ backgroundColor: 'lavender' }}>
                                {rec.imageUrl && (
                                    <>
                                        <img src={rec.imageUrl} alt={rec.text} className={styles.cardImageSmall} />
                                    </>
                                )}
                                <div className={styles.cardText}>
                                    <h3>{rec.text}</h3>
                                    {rec.type && <p><strong>요리 종류:</strong> {rec.type}</p>}
                                    <p><strong>재료:</strong> {rec.ingredients}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className={styles.carouselButton} onClick={handleRestartClick}>되돌아가기</button>
                </div>
            )}

            {!isLoading && waitingForInput && step === 6 && (
                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="질문을 입력하세요"
                        value={userMsg}
                        onChange={(e) => setUserMsg(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleQuestionSubmit(userMsg);
                                setWaitingForInput(false);
                            }
                        }}
                    />
                    <button className={styles.button} onClick={() => {
                        handleQuestionSubmit(userMsg);
                        setWaitingForInput(false);
                    }}>Send</button>
                    <button className={styles.button} onClick={handleBackClick}>되돌아가기</button>
                </div>
            )}
            {!isLoading && showBackOptions && (
                <div className={styles.inputContainer}>
                    <button className={styles.button} onClick={handleRestartClick}>처음으로 돌아가기</button>
                    <button className={styles.button} onClick={handleViewRecommendationsClick}>추천 메뉴 다시 보기</button>
                </div>
            )}
        </div>
    );
};

export default Chat;
