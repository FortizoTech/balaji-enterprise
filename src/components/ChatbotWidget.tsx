'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Loader2, ArrowRight, ExternalLink, Info, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendChatRequest } from '@/app/actions/chatbot';
import Link from 'next/link';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    recommendations?: { name: string; price: string; image: string; url: string }[];
}

const SUGGESTED_QUESTIONS = [
    "What are your shipping policies?",
    "Show me some marble collections",
    "How do I place an order?",
    "Where is your showroom located?",
    "Return and refund info"
];

export default function ChatbotWidget({
    standalone = true,
    onToggle
}: {
    standalone?: boolean,
    onToggle?: (isOpen: boolean) => void
}) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        onToggle?.(isOpen);
    }, [isOpen, onToggle]);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            sender: 'bot',
            text: 'Welcome to the Balaji Enterprise Atelier. How may I assist your curation today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'user',
            text: userMsg,
            timestamp: new Date()
        }]);
        setIsTyping(true);

        try {
            const result = await sendChatRequest(userMsg);
            if (!result.success) {
                const errorMessage: Message = {
                    id: Date.now().toString(),
                    text: result.error || "I'm having trouble connecting to the Balaji Enterprise network. Please try again or contact support directly.",
                    sender: 'bot',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
            } else {
                // Parse recommendations if present
                let cleanText = result.text || "";
                let recommendations: any[] = [];

                const recMatch = cleanText.match(/\[RECOMMENDATIONS:\s*(\[.*?\])\]/s);
                if (recMatch) {
                    try {
                        recommendations = JSON.parse(recMatch[1]);
                        cleanText = cleanText.replace(recMatch[0], "").trim();
                    } catch (e) {
                        console.error("Failed to parse recommendations", e);
                    }
                }

                const botMessage: Message = {
                    id: Date.now().toString(),
                    text: cleanText,
                    sender: 'bot',
                    timestamp: new Date(),
                    recommendations
                };
                setMessages(prev => [...prev, botMessage]);
            }
        } catch (error) {
            const errorMessage: Message = {
                id: Date.now().toString(),
                text: "I encountered a technical glitch while processing your request. Please try again.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={cn(standalone ? "fixed bottom-8 right-8" : "relative", "z-[100]")}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={cn(
                            "absolute w-[350px] md:h-[600px] max-w-[calc(100vw-4rem)] bg-white border border-border shadow-2xl flex flex-col overflow-hidden rounded-sm",
                            standalone ? "bottom-4 right-0" : "bottom-[-32px] right-4"
                        )}
                    >
                        {/* Header */}
                        <div className="bg-primary p-6 flex justify-between items-center bg-[url('/noise.png')]">
                            <div>
                                <h3 className="font-heading text-lg text-primary-foreground">Atelier Concierge</h3>
                                <p className="font-body text-[9px] tracking-widest uppercase text-gold">Design Specification Assistant</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth">
                            {messages.length === 1 && (
                                <div className="grid grid-cols-1 gap-2 mb-4">
                                    <p className="text-[10px] font-body uppercase tracking-wider text-gray-400 mb-1 ml-1">Suggested Inquiries</p>
                                    {SUGGESTED_QUESTIONS.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setInput(q);
                                                // We trigger send in next tick or just call it
                                                setTimeout(() => {
                                                    const btn = document.getElementById('chat-send-btn');
                                                    btn?.click();
                                                }, 10);
                                            }}
                                            className="text-left p-3 text-[11px] font-body text-gray-600 bg-white border border-gray-100 hover:border-gold hover:text-gold transition-all rounded-md flex items-center justify-between group"
                                        >
                                            {q}
                                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {messages.map((m) => (
                                <div key={m.id} className="space-y-3">
                                    <div className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-4 text-[13px] font-body leading-relaxed shadow-sm ${m.sender === 'user'
                                            ? 'bg-[#111] text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl'
                                            }`}>
                                            {m.text}
                                        </div>
                                    </div>

                                    {m.recommendations && m.recommendations.length > 0 && (
                                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                                            {m.recommendations.map((rec, i) => (
                                                <Link
                                                    key={i}
                                                    href={rec.url}
                                                    className="flex-shrink-0 w-[180px] bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                                                >
                                                    <div className="aspect-square bg-gray-50 relative overflow-hidden">
                                                        {rec.image && (
                                                            <img src={rec.image} alt={rec.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        )}
                                                        <div className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ExternalLink className="w-3 h-3 text-gold" />
                                                        </div>
                                                    </div>
                                                    <div className="p-3 space-y-1">
                                                        <h4 className="text-[11px] font-heading font-medium text-gray-900 truncate">{rec.name}</h4>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-body text-gold">{rec.price}</span>
                                                            <span className="text-[9px] font-body text-gray-400 uppercase tracking-tighter">View Detail</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                                        <Loader2 className="w-4 h-4 text-gold animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area with Exit on Left */}
                        <div className="p-4 bg-white border-t border-border flex items-center gap-2">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-gold transition-colors"
                                title="Close Chat"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Inquire about collections..."
                                className="flex-1 bg-transparent border-none focus:outline-none text-[13px] font-body px-2"
                            />
                            <button
                                id="chat-send-btn"
                                onClick={handleSend}
                                className="w-10 h-10 bg-[#111] text-white flex items-center justify-center hover:bg-gold hover:text-black transition-all rounded-md"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-10 h-10 md:w-12 md:h-12 bg-gold text-secondary-foreground flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-500 rounded-full"
                >
                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            )}
        </div>
    );
}
