'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/Chat.module.css';
import OpenAI from 'openai';
import Image from 'next/image';

const openai = new OpenAI({ apiKey: `${process.env.OPENAI_API_KEY}`, dangerouslyAllowBrowser: true });

interface ChatLog {
    type: 'user' | 'bot';
    message: string;
    imageUrl?: string;
}
const Chat = () => {
    const [userMsg, setUserMsg] = useState<string>("");
    const [chatLog, setChatLog] = useState<ChatLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<number>(1);
    const [dishName, setDishName] = useState<string>("");

    useEffect(() => {
        if (step === 1 && chatLog.length === 0) {
            const botMessage = "만들고 싶은 음식을 하단의 입력창에 입력해주세요. 궁금한 점을 알려드릴게요. ";
            setChatLog([{ type: 'bot', message: botMessage }]);
        }
    }, [step]);

    const handleSendMessage = async (message: string) => {
        const newChatLog = [...chatLog, { type: 'user', message }];
        setChatLog(newChatLog as ChatLog[]);
        setUserMsg('');
        setIsLoading(true);

        if (step === 1) {
            setDishName(message);
            const botMessage = "어떤 것이 궁금하신가요?";
            setChatLog([...newChatLog as ChatLog[], { type: 'bot', message: botMessage }]);
            setStep(2);
        } else {
            try {
                const response = await axios.post('/api/chat', {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: "당신은 도움이 되는 어시스턴트입니다." },
                        { role: 'user', content: `메뉴: ${dishName}. 질문: ${message}` },
                    ],
                    temperature: 1.0,
                    max_tokens: 300,
                });

                const botResponse = response.data.choices[0].message.content;
                const followUpMessage = `${dishName}에 대해서 더 궁금한 점은 없으신가요?, 있으시면 입력창에 입력해주세요. 다른 메뉴에 대해 궁금하시다면 검색창 옆에 되돌아가기 버튼을 눌러주세요.`;
                
                setChatLog([...newChatLog as ChatLog[], { type: 'bot', message: botResponse }, { type: 'bot', message: followUpMessage }]);
                setStep(3);
            } catch (error) {
                console.error("Error sending message:", error);
                setChatLog([...newChatLog as ChatLog[], { type: 'bot', message: "오류가 발생했습니다. 다시 시도해주세요." }]);
            }
        }

        setIsLoading(false);
    };

    const handleBackClick = () => {
        setStep(1);
        const botMessage = "만들고 싶은 음식을 하단의 입력창에 입력해주세요. 궁금한 점을 알려드릴게요.";
        setChatLog(prevChatLog => [...prevChatLog, { type: 'bot', message: botMessage }]);
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
                        <div className={styles.messageContainer}>
                            <p>{chat.message}</p>
                        </div>
                    </li>
                ))}
                {isLoading && (
                    <li key={chatLog.length} className={styles.chat}>
                        Loading...
                    </li>
                )}
            </ul>
            {!isLoading && (
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
                            }
                        }}
                    />
                    <button className={styles.button} onClick={() => handleSendMessage(userMsg)}>Send</button>
                    {step === 3 && (
                        <button className={styles.button} onClick={handleBackClick}>되돌아가기</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Chat;
