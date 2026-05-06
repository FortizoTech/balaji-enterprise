'use client';

import { Search } from 'lucide-react';
import { useState, useEffect, useRef, Suspense, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '../../hooks/use-debounce';

interface AdminSearchProps {
    placeholder?: string;
    className?: string;
}

function AdminSearchInner({
    placeholder = "Search...",
    className = ""
}: AdminSearchProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const initialQuery = searchParams.get('search') || '';
    const [query, setQuery] = useState(initialQuery);
    const debouncedQuery = useDebounce(query, 300);
    const isNavigating = useRef(false);

    // Sync from URL when navigating externally (e.g. back/forward)
    useEffect(() => {
        if (isNavigating.current) {
            isNavigating.current = false;
            return;
        }
        const urlSearch = searchParams.get('search') || '';
        if (urlSearch !== query) {
            setQuery(urlSearch);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Navigate when the debounced query changes
    useEffect(() => {
        const currentSearch = searchParams.get('search') || '';
        if (debouncedQuery === currentSearch) return;

        isNavigating.current = true;
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedQuery) {
            params.set('search', debouncedQuery);
        } else {
            params.delete('search');
        }
        params.delete('page');

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
            router.refresh();
        });
    }, [debouncedQuery, pathname, router, searchParams]);

    return (
        <div className={`relative ${className} ${isPending ? 'opacity-50' : ''}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-[#E5E5E5] rounded-md text-sm font-body focus:outline-none focus:border-[#C5A572] transition-colors"
            />
        </div>
    );
}

export default function AdminSearch(props: AdminSearchProps) {
    return (
        <Suspense fallback={
            <div className={`relative ${props.className || ''}`}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                    type="text"
                    placeholder={props.placeholder || "Search..."}
                    disabled
                    className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-[#E5E5E5] rounded-md text-sm font-body focus:outline-none transition-colors"
                />
            </div>
        }>
            <AdminSearchInner {...props} />
        </Suspense>
    );
}
