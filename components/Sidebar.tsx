'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    ClipboardList,
    Users,
    Building2,
    DollarSign,
    Settings,
    FileBarChart,
    FileCheck2,
    ReceiptText,
    Menu
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { User } from "@/index";
import {useIsMobile} from "@/hooks/use-mobile";

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const isMobile = useIsMobile();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            try {
                const currentUser = await getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [router]);

    if (loading || isMobile === null) {
        return (
            <div className={cn("pb-12 min-h-screen bg-sidebar border-r flex flex-col justify-center items-center", className)}>
                <p>Loading...</p>
            </div>
        );
    }

    const adminNavItems = [
        { title: "Dashboard", href: "/", icon: LayoutDashboard },
        { title: "Deliverable Approvals", href: "/approvals", icon: ClipboardList },
        { title: "Sponsors MOUs", href: "/sponsors", icon: Building2 },
        { title: "Department List", href: "/departments", icon: Users },
        { title: "Financial", href: "/financial", icon: DollarSign },
        { title: "Reports", href: "/reports", icon: FileBarChart },
        { title: "Settings", href: "/settings", icon: Settings },
    ];

    const departmentNavItems = [
        { title: "Department Dashboard", href: "/department-dashboard", icon: LayoutDashboard },
        { title: "Submit Proof", href: "/department-proof", icon: FileCheck2 },
        { title: "Settings", href: "/department-settings", icon: Settings },
    ];

    const financeNavItems = [
        { title: "Department Dashboard", href: "/department-dashboard", icon: LayoutDashboard },
        { title: "Submit Proof", href: "/department-proof", icon: FileCheck2 },
        { title: "Update Costs", href: "/finance/update-costs", icon: ReceiptText },
        { title: "Financial Summary", href: "/finance/finance-summary", icon: DollarSign },
        { title: "Settings", href: "/department-settings", icon: Settings },
    ];

    let navItems = adminNavItems;
    if (
        user?.role === 'department' ||
        user?.role === 'culturals' ||
        user?.role === 'technicals' ||
        user?.role === 'sports'
    ) navItems = departmentNavItems;
    else if (user?.role === 'finance') navItems = financeNavItems;

    const renderNav = () => (
        <>
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)} // close on click
                        className={cn(
                            "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary-foreground rounded-md transition",
                            { "bg-primary text-primary-foreground": isActive }
                        )}
                    >
                        <div className="flex items-center flex-1">
                            <item.icon className="h-4 w-4 mr-2" />
                            {item.title}
                        </div>
                    </Link>
                );
            })}
        </>
    );

    if (isMobile) {
        return (
            <>
                {/* Top Nav Bar */}
                <div className="fixed top-0 left-0 right-0 z-40 bg-sidebar border-b px-4 py-3 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2">
                        <Image src="/ParadoxLogo.png" alt="logo" height={32} width={38} />
                        <h2 className="text-lg font-semibold">Paradox</h2>
                    </div>
                    <button onClick={() => setMobileOpen(prev => !prev)}>
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                {/* Collapsible Sidebar Panel */}
                <div className={cn(
                    "fixed top-0 left-0 h-full w-64 bg-sidebar border-r z-50 transform transition-transform duration-300",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="px-4 py-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Image src="/ParadoxLogo.png" alt="logo" height={32} width={38} />
                            <h2 className="text-xl font-semibold tracking-tight">Paradox Sponsors</h2>
                        </div>
                        <div className="space-y-2">
                            {renderNav()}
                        </div>
                    </div>
                </div>

                {/* Backdrop */}
                {mobileOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black bg-opacity-50"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </>
        );
    }

    // Desktop Sidebar
    return (
        <div className={cn("pb-12 min-h-screen bg-sidebar border-r flex flex-col", className)}>
            <div className="space-y-4 py-4">
                <div className="px-4 py-2">
                    <div className="flex items-center gap-2 mb-8">
                        <Image src="/ParadoxLogo.png" alt="logo" height={32} width={38} />
                        <h2 className="text-xl font-semibold tracking-tight">Paradox Sponsors</h2>
                    </div>
                    <div className="space-y-1">
                        {renderNav()}
                    </div>
                </div>
            </div>
        </div>
    );
}
