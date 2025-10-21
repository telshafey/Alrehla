import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Loader2, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePublicData } from '../hooks/queries.ts';

interface Message {
    role: 'user' | 'model';
    parts: { text: string }[];
    productSuggestion?: { key: string; title: string; } | null;
}

interface ChatWidgetProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChatWidgetComponent: React.FC<ChatWidgetProps> = ({ isOpen, onClose }) => {
    const { data, isLoading: isDataLoading } = usePublicData();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const systemInstruction = `You are "Murshid", a friendly and creative guide for "Alrehla", a platform for children. Your goal is to help parents understand the platform's two main sections:
1.  **"Enha Lak"**: Creates personalized stories where the child is the hero. Products include: ${data?.personalizedProducts?.map(p => p.title).join(', ') || 'custom stories'}.
2.  **"Bidayat Alrehla"**: A creative writing program with live one-on-one sessions with specialized instructors. Packages include: ${data?.cw_packages?.map(p => p.name).join(', ') || 'various session packages'}.

Keep answers concise, friendly, and in Arabic. If a user's query is highly relevant to a specific product, suggest it using its key.
Available product keys: ${data?.personalizedProducts?.map(p => p.key).join(', ') || ''}, creative_writing_booking.

Always encourage exploration and end with a positive call to action.`;

    useEffect(() => {
        if (isOpen) {
            if (messages.length === 0) {
                setMessages([
                    {
                        role: 'model',
                        parts: [{ text: 'أهلاً بك في منصة الرحلة! أنا "مرشد"، مساعدك الإبداعي. كيف يمكنني مساعدتك في اكتشاف عوالمنا الساحرة اليوم؟' }]
                    }
                ]);
            }
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading || isDataLoading) return;

        const userMessage: Message = { role: 'user', parts: [{ text: input.trim() }] };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const historyForApi = [...messages, userMessage].map(msg => ({
                role: msg.role,
                parts: msg.parts,
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: historyForApi,
                    systemInstruction: systemInstruction,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from AI');
            }

            const responseData = await response.json();
            
            const productSuggestion = responseData.suggestedProductKey ? {
                key: responseData.suggestedProductKey,
                title: responseData.suggestedProductKey === 'creative_writing_booking' ? 'برنامج بداية الرحلة' : 'منتجات إنها لك'
            } : null;

            const modelMessage: Message = {
                role: 'model',
                parts: [{ text: responseData.responseText }],
                productSuggestion,
            };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error(error);
            const errorMessage: Message = {
                role: 'model',
                parts: [{ text: 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.' }],
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const getProductLink = (key: string) => {
        if (key === 'creative_writing_booking') return '/creative-writing/booking';
        return '/enha-lak/store';
    };

    return (
        <div
            className={`fixed bottom-6 left-6 sm:bottom-24 sm:left-6 z-50 bg-white rounded-2xl shadow-2xl w-[calc(100%-3rem)] sm:w-96 h-[70vh] sm:h-[60vh] flex flex-col transition-all duration-300 ease-in-out
            ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-widget-title"
        >
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b bg-gradient-to-br from-purple-50 to-indigo-50 rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full text-white">
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <h2 id="chat-widget-title" className="font-bold text-gray-800">المرشد الإبداعي</h2>
                        <p className="text-xs text-gray-500">متصل الآن</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200" aria-label="إغلاق الدردشة">
                    <X size={20} />
                </button>
            </header>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-purple-500 rounded-full text-white text-xs font-bold">M</div>}
                            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
                                {msg.productSuggestion && (
                                    <Link to={getProductLink(msg.productSuggestion.key)} onClick={onClose} className="mt-3 inline-block bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold text-xs py-1 px-3 rounded-full">
                                       <Package size={14} className="inline-block me-1"/> <span>اكتشف {msg.productSuggestion.title}</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                             <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-purple-500 rounded-full text-white text-xs font-bold">M</div>
                            <div className="max-w-[80%] p-3 rounded-2xl bg-white border">
                                <Loader2 className="animate-spin text-purple-500" />
                            </div>
                        </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="اسأل عن أي شيء..."
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading || isDataLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || isDataLoading}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-400"
                        aria-label="إرسال"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export const ChatWidget = React.memo(ChatWidgetComponent);