import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
    const phoneNumber = "+201234567890"; // Placeholder phone number
    const message = encodeURIComponent("مرحباً، لدي استفسار بخصوص منصة الرحلة");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 group flex items-center justify-center w-16 h-16 bg-green-500 rounded-full text-white shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-110"
            aria-label="تواصل معنا عبر واتساب"
        >
            <MessageCircle size={32} />
            <span className="absolute bottom-full mb-2 right-0 px-3 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                واتساب
            </span>
        </a>
    );
};

export default WhatsAppButton;