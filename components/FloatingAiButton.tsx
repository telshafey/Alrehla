import React from 'react';
import { Sparkles } from 'lucide-react';

interface FloatingAiButtonProps {
  onClick: () => void;
  isChatOpen: boolean;
}

const FloatingAiButton: React.FC<FloatingAiButtonProps> = ({ onClick, isChatOpen }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 left-6 z-50 group flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full text-white shadow-lg hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 transform animate-glow
        ${isChatOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 hover:scale-110'}`}
      aria-label="افتح المرشد الإبداعي"
      aria-hidden={isChatOpen}
      tabIndex={isChatOpen ? -1 : 0}
    >
      <Sparkles size={32} className="transition-transform group-hover:rotate-12" />
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        المرشد الإبداعي
      </span>
    </button>
  );
};

export default React.memo(FloatingAiButton);