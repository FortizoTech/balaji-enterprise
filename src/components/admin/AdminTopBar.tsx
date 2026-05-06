'use client';

import { useSession, signOut } from "next-auth/react";
import { Search, Bell, LogOut, Menu, Settings, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AdminTopBar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { data: session } = useSession();
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/admin/products?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <header className="h-14 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
            {/* Left Section: Mobile Menu & Search */}
            <div className="flex items-center gap-4 flex-1 max-w-md">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                    <Menu className="w-5 h-5 text-gray-500" />
                </button>
                <form onSubmit={handleSearch} className="flex items-center gap-3 flex-1">
                    <Search className="w-4 h-4 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search products, orders…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none font-body"
                    />
                </form>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-md hover:bg-gray-50 transition-colors relative">
                        <Bell className="w-4 h-4 text-gray-400" />
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E5E5E5] rounded-md shadow-2xl overflow-hidden py-0">
                            <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#F0F0F0]">
                                <h4 className="text-[10px] font-body text-gray-500 tracking-widest uppercase">Notifications</h4>
                            </div>
                            <div className="p-8 text-center text-gray-400 text-[11px] font-body">No new alerts</div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-gray-100" />

                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-50 transition-all duration-300 group"
                    >
                        {session?.user?.image ? (
                            <img
                                src={session.user.image}
                                alt={session.user.name || "Admin"}
                                className="w-8 h-8 rounded-full border border-gray-100 object-cover shadow-sm group-hover:border-[#C5A572]/30 transition-colors"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-[#C5A572]/10 flex items-center justify-center text-[10px] text-[#C5A572] font-bold border border-transparent group-hover:border-[#C5A572]/30 transition-colors">
                                {session?.user?.name?.charAt(0) || "A"}
                            </div>
                        )}
                        <div className="hidden md:block text-left">
                            <p className="text-[12px] font-body font-medium text-gray-700 leading-tight">
                                {session?.user?.name || "Administrator"}
                            </p>
                            <p className="text-[10px] font-body text-gray-400 leading-tight">Admin Access</p>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showUserMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden z-50"
                            >
                                <div className="p-4 border-b border-gray-50 bg-[#FAFAFA]/50">
                                    <p className="text-[11px] font-body font-semibold text-gray-900 truncate">
                                        {session?.user?.name}
                                    </p>
                                    <p className="text-[10px] font-body text-gray-400 truncate mt-0.5">
                                        {session?.user?.email}
                                    </p>
                                </div>
                                <div className="p-1.5">
                                    <Link
                                        href="/admin/settings"
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group/item"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover/item:bg-white transition-colors">
                                            <Settings className="w-4 h-4 text-gray-400 group-hover/item:text-[#C5A572] transition-colors" />
                                        </div>
                                        <span className="text-[12px] font-body text-gray-600 group-hover/item:text-gray-900 transition-colors">Settings</span>
                                    </Link>
                                </div>
                                <div className="p-1.5 border-t border-gray-50">
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors group/item"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-50/50 flex items-center justify-center group-hover/item:bg-red-50 transition-colors">
                                            <LogOut className="w-4 h-4 text-red-400/70 group-hover/item:text-red-500 transition-colors" />
                                        </div>
                                        <span className="text-[12px] font-body text-gray-600 group-hover/item:text-red-600 transition-colors">Sign Out</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
