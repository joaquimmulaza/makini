import { useState, useCallback, useRef } from 'react';
import { runAgent } from '../lib/geminiAgent';
import { supabase } from '../lib/supabase';

export function useMakiniAgent() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentCTA, setCurrentCTA] = useState(null);
    const [conversationHistory, setConversationHistory] = useState([]);
    const lastCallTime = useRef(0);

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

    const handleDirectMatch = useCallback(async (text) => {
        const lowerText = text.toLowerCase();
        
        // 1. "Preciso de um tractor em Luanda amanhã"
        if (lowerText.includes('tractor') && lowerText.includes('luanda')) {
            const { data } = await supabase.from('listings').select('*').ilike('titulo', '%trator%').ilike('localizacao', '%Luanda%').limit(1);
            if (data && data.length > 0) {
                return {
                    message: `Encontrei este **${data[0].titulo}** em Luanda disponível para amanhã. É exatamente o que precisa para começar o seu trabalho!`,
                    actionType: "VIEW_RESULTS",
                    actionData: { destination: 'search', parameters: { location: 'Luanda', category: 'Preparação do Solo' } }
                };
            }
        }

        // 2. "Quero transporte de colheita para esta semana"
        if (lowerText.includes('transporte') && lowerText.includes('colheita')) {
            return {
                message: "Temos várias opções de **transporte para escoamento de colheita** preparadas para esta semana. Veja as carrinhas e camiões disponíveis:",
                actionType: "VIEW_RESULTS",
                actionData: { destination: 'search', parameters: { category: 'Colheita' } }
            };
        }

        // 3. "Equipamento de rega para 50 hectares"
        if (lowerText.includes('rega')) {
            return {
                message: "Para uma área de **50 hectares**, estes sistemas de rega e equipamentos de aplicação de insumos são os mais recomendados. Confira o catálogo:",
                actionType: "VIEW_RESULTS",
                actionData: { destination: 'search', parameters: { category: 'Aplicação de Insumos' } }
            };
        }

        return null;
    }, []);

    const sendMessage = useCallback(async (text) => {
        if (!text.trim()) return;

        const now = Date.now();
        if (now - lastCallTime.current < 2000) return; // ignora cliques duplos / rate limit
        lastCallTime.current = now;

        // Remove current CTA when a new message is sent
        setCurrentCTA(null);

        const newUserMsg = { id: Date.now().toString() + '-user', role: 'user', content: text };
        setMessages(prev => [...prev, newUserMsg]);
        setIsLoading(true);

        try {
            // Check for direct match first (bypassing Gemini for example buttons)
            const directMatch = await handleDirectMatch(text);
            
            let message, actionType, actionData;

            if (directMatch) {
                message = directMatch.message;
                actionType = directMatch.actionType;
                actionData = directMatch.actionData;
                // Add a small artificial delay to feel like a real (but fast) response
                await new Promise(resolve => setTimeout(resolve, 800));
            } else {
                const result = await runAgent(text, conversationHistory);
                message = result.message;
                actionType = result.actionType;
                actionData = result.actionData;
            }

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
