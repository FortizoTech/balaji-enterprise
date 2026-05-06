'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import ScrollToTop from './ScrollToTop';
import ChatbotWidget from './ChatbotWidget';
import { cn } from '@/lib/utils';

export default function FloatingWidgets() {
    const pathname = usePathname();
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Hide widgets on dashboard and admin pages
    const isInternalPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');

    if (isInternalPage) return null;

    return (
        <div className="fixed right-6 bottom-8 z-[100] flex flex-col gap-4 items-center">
            {/* 
                We hide the ScrollToTop and the main Chatbot toggle when the chat window is open.
                The chat window itself has an internal 'X' button to close.
            */}
            <ChatbotWidget
                standalone={false}
                onToggle={(open) => setIsChatOpen(open)}
            />
            {!isChatOpen && <ScrollToTop standalone={false} />}
        </div>
    );
}
