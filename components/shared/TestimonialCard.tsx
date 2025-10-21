import React from 'react';
import { Quote, Star } from 'lucide-react';

const TestimonialCard: React.FC<{ quote: string, author: string, role: string }> = ({ quote, author, role }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg h-full flex flex-col">
        <Quote className="w-10 h-10 text-blue-100 transform rotate-180 mb-2" />
        <div className="flex">
            <Star className="text-yellow-400 me-1" fill="currentColor" />
            <Star className="text-yellow-400 me-1" fill="currentColor" />
            <Star className="text-yellow-400 me-1" fill="currentColor" />
            <Star className="text-yellow-400 me-1" fill="currentColor" />
            <Star className="text-yellow-400 mb-4" fill="currentColor" />
        </div>
        <p className="text-gray-600 italic mb-6 flex-grow">"{quote}"</p>
        <div>
            <p className="font-bold text-gray-800">{author}</p>
            <p className="text-sm text-gray-500">{role}</p>
        </div>
    </div>
);

export default React.memo(TestimonialCard);