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
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {getCurrentUser} from "@/lib/actions/auth.action";

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className={cn("pb-12 min-h-screen bg-sidebar border-r flex flex-col justify-center items-center", className)}>
                <p>Loading...</p>
            </div>
        );
    }

    const adminNavItems = [
        {
            title: "Dashboard",
            href: "/",
            icon: LayoutDashboard,
        },
        {
            title: "Deliverable Approvals",
            href: "/deliverables",
            icon: ClipboardList,
        },
        {
            title: "Sponsors MOUs",
            href: "/sponsors",
            icon: Building2,
        },
        {
            title: "Department List",
            href: "/departments",
            icon: Users,
        },
        {
            title: "Financial",
            href: "/financial",
            icon: DollarSign,
        },
        {
            title: "Reports",
            href: "/reports",
            icon: FileBarChart,
        },
        {
            title: "Settings",
            href: "/settings",
            icon: Settings,
        },
    ];

    const departmentNavItems = [
        {
            title: "Department Dashboard",
            href: "/department-dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Submit Proof",
            href: "/department-proof",
            icon: FileCheck2,
        },
        {
            title: "Settings",
            href: "/department-settings",
            icon: Settings,
        },
    ];

    const navItems = user?.role === 'department' ? departmentNavItems : adminNavItems;

    return (
        <div className={cn("pb-12 min-h-screen bg-sidebar border-r flex flex-col", className)}>
            <div className="space-y-4 py-4">
                <div className="px-4 py-2">
                    <div className="flex items-center gap-2 mb-8">
                        <Image src="/ParadoxLogo.png" alt="logo" height={32} width={38}/>
                        <h2 className="text-xl font-semibold tracking-tight">
                            Paradox Sponsors
                        </h2>
                    </div>
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary-foreground rounded-md transition",
                                        {
                                            "bg-primary text-primary-foreground": isActive,
                                        }
                                    )}
                                >
                                    <div className="flex items-center flex-1">
                                        <item.icon className="h-4 w-4 mr-2" />
                                        {item.title}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
