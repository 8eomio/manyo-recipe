'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/Chat.module.css';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: 'your-openai-api-key', dangerouslyAllowBrowser: true });

interface ChatLog {
    type: 'user' | 'bot';
    message: string;
    imageUrl?: string;
}

interface Recommendation {
    text: string;
    id: string;
    cookingTime?: string;
    difficulty?: string;
    ingredients?: string[];
}

interface RefriItem {
    id: string;
    usrid: string;
    ingredient: string;
    exp_date: string;
}

async function fetchRefriApiCall() {
  console.log("fetchRefriApiCall called");
  const res = await fetch("http://localhost:3000/api/refrigerator", { cache: "no-store" });
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
        console.log("Current step:", step);
    }, [step]);

    useEffect(() => {
        console.log("Current recommendations:", recommendations);
    }, [recommendations]);

    const handleSendMessage = async (message: string) => {
        console.log("handleSendMessage called with message:", message);
        const newChatLog = [...chatLog, { type: 'user', message }];
        setChatLog(newChatLog);
        setUserMsg('');
        setIsLoading(true);

        const newContext = { ...context };
        switch (step) {
            case 1:
                newContext.wantToCook = `만들고 싶은 음식: ${message}`;
                break;
            case 2:
                newContext.ingredients = `추가하고 싶은 재료: ${message}`;
                break;
            case 3:
                newContext.preferredCuisine = `선호하는 음식 종류: ${message}`;
                break;
            case 4:
                newContext.additionalInfo = `추가 정보: ${message}`;
                break;
        }
        setContext(newContext);
        console.log("Updated context:", newContext);

        if (step < 4) {
            setStep(step + 1);
            setIsLoading(false);
            setWaitingForInput(false);
        } else {
            await requestRecommendations(newContext, newChatLog);
        }
    };

    const requestRecommendations = async (context: any, chatLog: ChatLog[]) => {
        try {
            const response = await axios.post('/api/chat', {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: "당신은 도움이 되는 어시스턴트입니다." },
                    { role: 'user', content: `사용자의 입력을 기반으로 음식 추천을 해주세요. 컨텍스트: ${JSON.stringify(context)}. 사용자가 선호하는 재료와 음식 종류를 포함한 5개의 음식 메뉴를 추천해주세요. 각 메뉴는 다음 형식을 따라야 하고, 그외의 말은 하지 마.: 음식 이름 - 난이도 - 소요 시간 - 재료 목록.` },
                ],
                temperature: 1.0,
                max_tokens: 1000,
            });

            console.log("API response:", response.data);

            if (response.data.choices && response.data.choices.length > 0) {
                const botMessage = response.data.choices[0].message.content;
                console.log("Bot Message:", botMessage);

                const recommendationList = botMessage.split('\n').filter(text => text.trim() !== "")
                    .map((text, index) => {
                        try {
                            console.log(`Parsing recommendation: ${text}`);
                            const parts = text.split(' - ');
                            if (parts.length !== 4) {
                                throw new Error('Incorrect format');
                            }
                            const [name, difficultyLine, timeLine, ingredientsLine] = parts;
                            console.log("Parsed parts:", { name, difficultyLine, timeLine, ingredientsLine });

                            const difficulty = difficultyLine.trim();
                            const cookingTime = timeLine.trim();
                            const ingredients = ingredientsLine.split(',').map(ingredient => ingredient.trim());

                            return {
                                text: name.trim(),
                                id: `recommendation-${index}`,
                                cookingTime: cookingTime,
                                difficulty: difficulty,
                                ingredients: ingredients
                            };
                        } catch (error) {
                            console.error('Error parsing recommendation:', text, error);
                            return null;
                        }
                    })
                    .filter(rec => rec !== null);

                console.log("Recommendations:", recommendationList);
                setRecommendations(recommendationList as Recommendation[]);
                setChatLog([...chatLog, { type: 'bot', message: "추천된 메뉴:" }]);
                setWaitingForInput(false);
                setIsRecommending(true);
            } else {
                console.error("Unexpected API response format:", response.data);
                setChatLog([...chatLog, { type: 'bot', message: "API 응답을 처리하는 중 문제가 발생했습니다." }]);
            }
            setIsLoading(false);
        } catch (err) {
            console.error("Error sending message:", err);
            setChatLog([...chatLog, { type: 'bot', message: "메시지를 보내는 중 오류가 발생했습니다." }]);
            setIsLoading(false);
        }
    };

    const handleAnotherRecommendationClick = async () => {
        console.log("handleAnotherRecommendationClick called");
        setIsLoading(true);
        const excludedRecommendations = recommendations.map(rec => rec.text).join(', ');
        const newContext = { ...context, exclude: excludedRecommendations };
        await requestRecommendations(newContext, chatLog);
    };

    const getBotMessage = () => {
        if (isRecommending) {
            return "";
        }

        if (showIngredientsSelection) {
            return "냉장고에 있는 재료들 중에 넣고 싶은 재료들을 여러 개 선택해주세요. 최대한 반영해서 추천해드릴게요.";
        }

        switch (step) {
            case 1:
                return "만들고 싶은 특정 음식이 있나요? 없다면, 당신의 취향에 맞는 음식을 추천해 드릴게요.";
            case 2:
                return "넣고 싶은 재료가 있나요?";
            case 3:
                return "선호하는 음식 종류가 있나요? (한식, 양식, 일식 등) 또는 좋아하는 음식을 말해 주세요 (예: 김치찌개)! 비슷한 음식을 추천해 드릴게요!";
            case 4:
                return "추가적인 정보가 있나요? (간단히 만들고 싶은 음식, 파티 음식, 캠핑 음식, 새로운 퓨전 메뉴 개발, 다이어트 음식)";
            case 5:
                return "냉장고에 있는 재료들을 기반으로 추천해드릴까요?";
            default:
                return "";
        }
    };

    const handleButtonClick = async (message: string) => {
        const newChatLog = [...chatLog, { type: 'user', message }];
        setChatLog(newChatLog);

        if (message === 'YES' && step !== 4) {
            setWaitingForInput(true);
            if (step === 5) {
                setShowIngredientsSelection(true);
                setWaitingForInput(false);
            }
        } else if (message === 'NO' && step === 1) {
            setStep(5);
        } else if (message === 'NO' && step === 5) {
            setStep(2);
            setWaitingForInput(false);
        } else if (message === 'NO' && step !== 4) {
            setWaitingForInput(false);
            setStep(step + 1);
        } else if (message === 'YES' && step === 4) {
            setWaitingForInput(true);
        } else if (message === 'NO' && step === 4) {
            await requestRecommendations(context, newChatLog);
        }
    };

    const handleRecommendationClick = async (message: string) => {
        console.log("handleRecommendationClick called with message:", message);
        setSelectedRecipe(message);
        setChatLog(prevChatLog => [...prevChatLog, { type: 'user', message }]);
        setIsLoading(true);

        try {
            const response = await axios.post('/api/chat', {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: "당신은 도움이 되는 어시스턴트입니다." },
                    { role: 'user', content: `선택된 메뉴에 대한 레시피를 제공해 주세요. 레시피는 다음 항목을 포함해야 합니다, 각 항목별로 빈공백으로 구분해서 보여줘, 다른 기호나 이 항목에 포함되지 않는건 작성하지 마: 난이도, 소요 시간, 전체 요리 재료 (조미료 및 비조미료 구분), 필수 요리 재료, 대체 가능한 요리 재료, 칼로리 (1인분 기준), 조리 과정. 메뉴: ${message}` },
                ],
                temperature: 1.0,
                max_tokens: 1500,
            });

            console.log("API response:", response.data);

            if (response.data.choices && response.data.choices.length > 0) {
                const botMessage = response.data.choices[0].message.content;
                const recipeDetails = botMessage.split('조리 과정:')[0].trim();
                setChatLog(prevChatLog => [...prevChatLog, { type: 'bot', message: recipeDetails }]);

                const cookingSteps = botMessage.split('조리 과정:')[1]?.trim().split('\n').filter(step => step.trim() !== "");
                if (cookingSteps) {
                    for (const step of cookingSteps) {
                        const translatedStep = await translateToEnglish(step);

                        console.log("Translated text:", translatedStep);
                        console.log("Generating image for step:", translatedStep);
                        const imageResponse = await openai.images.generate({
                            prompt: `Please make a photo of the cooking process for making ${message}. The cooking process is: ${translatedStep}.`,
                            n: 1,
                            size: "256x256",
                        });

                        console.log("Image response:", imageResponse.data);

                        if (imageResponse.data && imageResponse.data.length > 0) {
                            const imageUrl = imageResponse.data[0].url;
                            setChatLog(prevChatLog => [...prevChatLog, { type: 'bot', message: step }]);
                            setChatLog(prevChatLog => [...prevChatLog, { type: 'bot', message: '', imageUrl }]);
                        } else {
                            console.error("No image data found in response.");
                        }
                    }
                }
                setChatLog(prevChatLog => [...prevChatLog, { type: 'bot', message: "레시피에 대해 궁금한 점이 있으신가요? 예: 신 김치를 사용해야 하나요? 김치를 얼마나 볶아야 하나요?" }]);
                setWaitingForInput(true);
                setStep(6);
                setIsRecommending(false);
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

        try {
            const response = await axios.post('/api/chat', {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: "당신은 도움이 되는 어시스턴트입니다." },
                    { role: 'user', content: `다음 질문에 답해 주세요. 질문: ${question}. 메뉴: ${selectedRecipe}` },
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
    };

    const handleIngredientsSubmit = () => {
        setContext({ ...context, ingredients: `추가하고 싶은 재료: ${selectedIngredients.join(', ')}` });
        setShowIngredientsSelection(false);
        setStep(2);
        setWaitingForInput(false); // Set this to false as the next step will handle user input again
    };

    return (
        <div>
            <ul className={styles.feed}>
                {chatLog.map((chat, index) => (
                    <li
                        key={index}
                        className={`${styles.chat} ${chat.type === 'user' ? styles.user : styles.bot}`}
                    >
                        {chat.message}
                        {chat.imageUrl && <img src={chat.imageUrl} alt="Cooking Step" />}
                    </li>
                ))}
                {isLoading && (
                    <li key={chatLog.length} className={styles.chat}>
                        Loading...
                    </li>
                )}
            </ul>
            {!isLoading && (
                <div>
                    <p>{getBotMessage()}</p>
                    {!showIngredientsSelection && !waitingForInput && step <= 5 && !isRecommending && (
                        <div>
                            <button className={styles.button} onClick={() => handleButtonClick('YES')}>YES</button>
                            <button className={styles.button} onClick={() => handleButtonClick('NO')}>NO</button>
                        </div>
                    )}
                    {!showIngredientsSelection && waitingForInput && step <= 4 && !isRecommending && (
                        <div>
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
                    {step === 4 && recommendations.length > 0 && (
                        <div className={styles.carousel}>
                            <div className={styles.carouselInner}>
                                {recommendations.map((rec) => (
                                    <div key={rec.id} className={styles.card} onClick={() => handleRecommendationClick(rec.text)}>
                                        <div className={styles.cardText}>
                                            <h3>{rec.text}</h3>
                                            <p>난이도: {rec.difficulty}</p>
                                            <p>소요 시간: {rec.cookingTime}</p>
                                            <p>재료: {rec.ingredients?.join(', ')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className={styles.carouselButton} onClick={handleAnotherRecommendationClick}>다른 음식 추천</button>
                        </div>
                    )}
                    {waitingForInput && step === 6 && (
                        <div>
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
                    {showBackOptions && (
                        <div>
                            <button className={styles.button} onClick={handleRestartClick}>처음으로 돌아가기</button>
                            <button className={styles.button} onClick={handleViewRecommendationsClick}>추천 메뉴 다시 보기</button>
                        </div>
                    )}
                    {showIngredientsSelection && (
                        <div>
                            <div>
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
                            </div>
                            <button className={styles.button} onClick={handleIngredientsSubmit}>완료</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Chat;
