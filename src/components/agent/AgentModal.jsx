import React from 'react';
import AgentChat from './AgentChat';
import AgentInput from './AgentInput';
import AgentCTA from './AgentCTA';

export default function AgentModal({
    isOpen,
    closeAgent,
    messages,
    isLoading,
    currentCTA,
    sendMessage,
    clearConversation
}) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={closeAgent}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div className="fixed z-50 bottom-0 right-0 w-full h-[100dvh] md:w-[400px] md:h-[600px] md:bottom-24 md:right-6 md:rounded-2xl flex flex-col bg-white shadow-2xl overflow-hidden animate-slide-up origin-bottom">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-[#1B4332] text-white shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                <rect x="3" y="11" width="18" height="10" rx="2" />
                                <circle cx="12" cy="5" r="2" />
                                <path d="M12 7v4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-serif text-xl font-bold tracking-wide">Makini Agent</h2>
                            <p className="text-xs text-emerald-100 font-medium">O seu gestor agrícola</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        <button
                            onClick={clearConversation}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
                            title="Limpar conversa"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                        </button>
                        <button
                            onClick={closeAgent}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
                            aria-label="Fechar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <AgentChat
                    messages={messages}
                    isLoading={isLoading}
                    onSuggestionClick={sendMessage}
                />

                {/* CTA Area (Conditional) */}
                {currentCTA && (
                    <div className="shrink-0 bg-[#FAFAF8]">
                        <AgentCTA cta={currentCTA} onClose={closeAgent} />
                    </div>
                )}

                {/* Input Area */}
                <div className="shrink-0 z-10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                    <AgentInput onSend={sendMessage} isLoading={isLoading} />
                </div>
            </div>
        </>
    );
}
