import React from 'react';
import { SummaryMetrics } from "@/components/dashboard/SummaryMetrics";
import { SponsorPerformance } from "@/components/dashboard/SponsorPerformance";
import { DepartmentPerformance } from "@/components/dashboard/DepartmentPerformance";
import { getCurrentUser } from '@/lib/actions/auth.action';
import { redirect } from "next/navigation";

const AdminDashboardPage = async () => {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/sign-in'); // Not logged in
    }

    if (user.role !== 'admin' && user.role !== 'viewer') {
        // 🚀 If someone (department user) tries to access admin dashboard force redirect
        if (user.role === 'department') {
            redirect('/department-dashboard');
        } else {
            redirect('/'); // Any other roles
        }
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6 bg-background/95">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {user.name} 's Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Overview of all sponsorship activities and performance metrics. <br/>
                            <strong>Role:</strong> {user.role}
                        </p>
                    </div>

                    <SummaryMetrics className="mt-4" />

                    {/*<div className="grid gap-6 md:grid-cols-2">*/}
                    {/*    <FinancialMetrics />*/}
                    {/*    <div className="grid gap-6 grid-cols-1">*/}
                    {/*        <DeliverableStatus />*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    <SponsorPerformance />

                    <DepartmentPerformance />
                </div>
            </main>
        </div>
    );
}

export default AdminDashboardPage;
