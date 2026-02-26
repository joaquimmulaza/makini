import React, { useState, useRef, useEffect } from 'react';

export default function AgentInput({ onSend, isLoading }) {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        // Keep focus when not loading
        if (!isLoading && inputRef.current) {
            // slight delay to prevent stealing focus immediately upon render if unwanted, 
            // but typically good for chat inputs
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            onSend(inputValue);
            setInputValue('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="p-4 bg-white border-t border-gray-100 rounded-b-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col relative">
                <div className="relative flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escreva a sua mensagem..."
                        disabled={isLoading}
                        className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all disabled:opacity-50 text-[15px]"
                    />

                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading}
                        className={`absolute right-2 p-2 rounded-lg transition-colors flex items-center justify-center
                ${inputValue.trim() && !isLoading ? 'bg-[#1B4332] text-white hover:bg-[#123023] cursor-pointer' : 'bg-transparent text-gray-400 cursor-not-allowed'}
            `}
                        aria-label="Enviar mensagem"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="translate-x-0.5">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
                <p className="text-[11px] text-gray-400 text-center mt-2 font-medium">
                    Powered by Gemini AI
                </p>
            </form>
        </div>
    );
}
