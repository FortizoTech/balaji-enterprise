'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    ChevronLeft,
    Gem,
    Banknote,
    MessageSquare,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Financials', href: '/admin/finances', icon: Banknote },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            {/* Mobile Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-[55] lg:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setOpen(false)}
                />
            )}

            <aside
                className={cn(
                    "fixed left-0 top-0 h-screen bg-[#111111] text-white flex flex-col transition-all duration-300 z-[60] lg:z-50",
                    collapsed ? "lg:w-[72px]" : "lg:w-[260px]",
                    "w-[280px] lg:translate-x-0",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className={cn(
                    "h-16 flex items-center border-b border-white/5 px-5",
                    collapsed ? "justify-center" : "justify-between"
                )}>
                    {!collapsed && (
                        <Link href="/admin" className="flex items-center gap-2.5">
                            <Gem className="w-5 h-5 text-[#C5A572]" />
                            <span className="font-heading text-sm tracking-[0.15em] uppercase text-white/90">
                                Balaji Enterprise
                            </span>
                            <span className="text-[9px] tracking-wider text-[#C5A572]/60 uppercase font-body font-medium ml-1">
                                Admin
                            </span>
                        </Link>
                    )}
                    {collapsed && <Gem className="w-5 h-5 text-[#C5A572]" />}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1 rounded hover:bg-white/5 transition-colors"
                    >
                        <ChevronLeft className={cn(
                            "w-4 h-4 text-white/30 transition-transform",
                            collapsed && "rotate-180"
                        )} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-0.5">
                    {navItems.map((item) => {
                        const isActive = item.href === '/admin'
                            ? pathname === '/admin'
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-body tracking-wide transition-all duration-200",
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "text-white/40 hover:text-white/70 hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-[18px] h-[18px] flex-shrink-0",
                                    isActive ? "text-[#C5A572]" : "text-white/30"
                                )} />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className={cn(
                    "border-t border-white/5 p-4",
                    collapsed ? "text-center" : ""
                )}>
                    <Link
                        href="/"
                        className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/40 transition-colors font-body"
                    >
                        {collapsed ? "←" : "← Back to Storefront"}
                    </Link>
                </div>
            </aside>
        </>
    );
}
