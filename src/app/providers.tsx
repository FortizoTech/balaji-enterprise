'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    {children}
                    <Toaster />
                </TooltipProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}
