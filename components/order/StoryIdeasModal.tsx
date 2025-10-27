import React, { useRef } from 'react';
import { X, Lightbulb, Check } from 'lucide-react';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

const storyGoals: { [key: string]: string } = {
    respect: 'الاستئذان والاحترام',
    cooperation: 'التعاون والمشاركة',
    honesty: 'الصدق والأمانة',
    cleanliness: 'النظافة والترتيب',
    time_management: 'تنظيم الوقت',
    emotion_management: 'إدارة العواطف',
    problem_solving: 'حل المشكلات',
    creative_thinking: 'التفكير الإبداعي',
};

interface StoryIdea {
    title: string;
    premise: string;
    goal_key: string;
}

interface StoryIdeasModalProps {
    isOpen: boolean;
    onClose: () => void;
    ideas: StoryIdea[];
    onSelectIdea: (idea: StoryIdea) => void;
}

const StoryIdeasModal: React.FC<StoryIdeasModalProps> = ({ isOpen, onClose, ideas, onSelectIdea }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="story-ideas-title"
        >
            <div 
                ref={modalRef} 
                className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 sm:p-8 m-4 animate-fadeIn max-h-[90vh] overflow-y-auto" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 id="story-ideas-title" className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Lightbulb className="text-yellow-400" />
                        أفكار قصص ملهمة
                    </h2>
                    <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {ideas.length > 0 ? (
                        ideas.map((idea, index) => (
                            <div key={index} className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="text-xl font-bold text-blue-600">{idea.title}</h3>
                                <p className="mt-2 text-gray-600 leading-relaxed">{idea.premise}</p>
                                <div className="mt-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                    <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                        الهدف: {storyGoals[idea.goal_key] || idea.goal_key}
                                    </span>
                                    <button 
                                        onClick={() => onSelectIdea(idea)}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-green-700 transition-colors"
                                    >
                                        <Check size={16} />
                                        استخدام هذه الفكرة
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">لم يتم العثور على أفكار. حاول تغيير وصف الطفل.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoryIdeasModal;