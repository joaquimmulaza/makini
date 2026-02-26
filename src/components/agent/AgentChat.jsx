import React, { useEffect, useRef } from 'react';
import AgentMessage from './AgentMessage';

const TypingIndicator = () => (
    <div className="flex w-full justify-start mb-4 animate-fade-in-up">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1B4332] flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
            </svg>
        </div>

        <div className="bg-[#D1FAE5] text-[#111827] rounded-2xl rounded-tl-none px-4 py-4 flex space-x-1.5 items-center">
            <div className="w-2 h-2 bg-[#1B4332] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[#1B4332] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-[#1B4332] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
    </div>
);

export default function AgentChat({ messages, isLoading, onSuggestionClick }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#FAFAF8] space-y-2">
            {messages.map((msg, index) => (
                <AgentMessage
                    key={msg.id || index}
                    message={msg.content}
                    isAssistant={msg.role === 'assistant'}
                />
            ))}

            {/* Show suggestions only if it's the first message and not loading */}
            {messages.length === 1 && !isLoading && (
                <div className="flex flex-col gap-2 mt-4 ml-11 min-w-0 max-w-[80%] animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <p className="text-xs text-gray-500 font-medium mb-1">Exemplos do que pode pedir:</p>
                    <button
                        onClick={() => onSuggestionClick("Preciso de um tractor em Huambo amanhã")}
                        className="text-left text-sm bg-white border border-emerald-100 hover:border-[#1B4332] hover:bg-emerald-50 text-[#1B4332] px-3 py-2 rounded-lg transition-colors"
                    >
                        "Preciso de um tractor em Huambo amanhã"
                    </button>
                    <button
                        onClick={() => onSuggestionClick("Quero transporte de colheita para esta semana")}
                        className="text-left text-sm bg-white border border-emerald-100 hover:border-[#1B4332] hover:bg-emerald-50 text-[#1B4332] px-3 py-2 rounded-lg transition-colors"
                    >
                        "Quero transporte de colheita para esta semana"
                    </button>
                    <button
                        onClick={() => onSuggestionClick("Equipamento de rega para 50 hectares")}
                        className="text-left text-sm bg-white border border-emerald-100 hover:border-[#1B4332] hover:bg-emerald-50 text-[#1B4332] px-3 py-2 rounded-lg transition-colors"
                    >
                        "Equipamento de rega para 50 hectares"
                    </button>
                </div>
            )}

            {isLoading && <TypingIndicator />}

            <div ref={bottomRef} className="h-1" />
        </div>
    );
}
