import React from 'react';
import { Sparkles } from 'lucide-react';

const FloatingAiButton: React.FC = () => {
    return (
        <button className="fixed bottom-6 left-6 z-50 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700">
            <Sparkles size={24} />
        </button>
    );
};

export default FloatingAiButton;
