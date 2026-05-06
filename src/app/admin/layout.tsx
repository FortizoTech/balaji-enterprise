'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Isolate login page from the admin dashboard shell
    const isLoginPage = pathname === '/admin/login';

    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-[#FBFBFA]">
                {children}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <div className="lg:ml-[260px] transition-all duration-300">
                <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />
                <main className="p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
