import React, { useState } from 'react';

// Using a simple SVG icon for the robot
const RobotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
);

export default function AgentButton({ onClick, hasNotification = true }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center">
            {/* Tooltip */}
            {isHovered && (
                <div className="mr-4 bg-white text-[#1B4332] px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-fade-in-left whitespace-nowrap">
                    Fala com o Makini Agent
                </div>
            )}

            {/* Button */}
            <button
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative flex items-center justify-center w-[60px] h-[60px] rounded-full bg-[#1B4332] hover:bg-[#123023] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 z-50 animate-pulse group"
                aria-label="Abrir Makini Agent"
            >
                <div className="group-hover:animate-none">
                    <RobotIcon />
                </div>

                {/* Notification Badge */}
                {hasNotification && (
                    <span className="absolute top-0 right-0 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-[#1B4332]"></span>
                    </span>
                )}
            </button>
        </div>
    );
}
