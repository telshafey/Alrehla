import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-t first:border-t-0">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full p-4 text-right"
            >
                <span className="font-bold text-lg text-foreground">{title}</span>
                <ChevronDown 
                    className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-primary' : ''}`} 
                />
            </button>
            <div 
                className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Accordion;