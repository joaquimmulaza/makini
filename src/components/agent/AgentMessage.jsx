import React from 'react';

const RobotAvatar = () => (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1B4332] flex items-center justify-center mr-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
        </svg>
    </div>
);

export default function AgentMessage({ message, isAssistant }) {
    // Use dangerouslySetInnerHTML sparingly. Assuming message is raw text, simple formatting
    // Let's replace asterisks with strong tags to support simple markdown from Gemini
    const formattedContent = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return (
        <div className={`flex w-full min-w-0 ${isAssistant ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in-up`}>
            {isAssistant && <RobotAvatar />}

            <div
                className={`relative max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed break-words shadow-sm
          ${isAssistant
                        ? 'bg-[#D1FAE5] text-[#111827] rounded-tl-none font-sans whitespace-pre-wrap'
                        : 'bg-[#1B4332] text-white rounded-tr-none font-sans'
                    }
        `}
            >
                {isAssistant ? (
                    <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
                ) : (
                    <span>{message}</span>
                )}
            </div>
        </div>
    );
}
