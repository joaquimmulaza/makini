import { useState, useCallback } from 'react';
import { runAgent } from '../lib/geminiAgent';

export function useMakiniAgent() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentCTA, setCurrentCTA] = useState(null);
    const [conversationHistory, setConversationHistory] = useState([]);

    const openAgent = useCallback((initialQuery = null) => {
        setIsOpen(true);

        // Add default welcome message if history is empty
        if (messages.length === 0) {
            setMessages([
                {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "Olá! Sou o Makini Agent 👋 Diga-me o que precisa — equipamento, local e data — e eu encontro as melhores opções para si. Pode falar naturalmente, como se estivesse a falar com um colega."
                }
            ]);
        }

        if (initialQuery) {
            sendMessage(initialQuery);
        }
    }, [messages.length]);

    const closeAgent = useCallback(() => {
        setIsOpen(false);
    }, []);

    const clearConversation = useCallback(() => {
        setMessages([]);
        setConversationHistory([]);
        setCurrentCTA(null);

        // Re-add welcome message immediately
        setMessages([
            {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Olá! Sou o Makini Agent 👋 Diga-me o que precisa — equipamento, local e data — e eu encontro as melhores opções para si. Pode falar naturalmente, como se estivesse a falar com um colega."
            }
        ]);
    }, []);

    const sendMessage = useCallback(async (text) => {
        if (!text.trim()) return;

        // Remove current CTA when a new message is sent
        setCurrentCTA(null);

        const newUserMsg = { id: Date.now().toString() + '-user', role: 'user', content: text };
        setMessages(prev => [...prev, newUserMsg]);
        setIsLoading(true);

        try {
            const { message, actionType, actionData } = await runAgent(text, conversationHistory);

            const newAssistantMsg = {
                id: Date.now().toString() + '-asst',
                role: 'assistant',
                content: message
            };

            setMessages(prev => [...prev, newAssistantMsg]);

            // Update history for Gemini (limiting to last 20 messages for context)
            setConversationHistory(prev => {
                const newHistory = [...prev, { role: 'user', content: text }, { role: 'assistant', content: message }];
                if (newHistory.length > 20) {
                    return newHistory.slice(newHistory.length - 20);
                }
                return newHistory;
            });

            // Handle CTAs based on actionType
            if (actionType && actionType !== "NONE") {
                setCurrentCTA({ type: actionType, data: actionData });
            }

        } catch (error) {
            console.error("Agent Hook Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString() + '-err',
                role: 'assistant',
                content: "Desculpe, ocorreu um erro ao processar o seu pedido. Por favor, tente novamente."
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [conversationHistory]);

    return {
        isOpen,
        openAgent,
        closeAgent,
        messages,
        isLoading,
        currentCTA,
        sendMessage,
        clearConversation
    };
}
