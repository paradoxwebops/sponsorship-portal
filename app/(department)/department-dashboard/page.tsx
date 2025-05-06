import React from 'react'
import {getCurrentUser} from "@/lib/actions/auth.action";

const Page = async () => {
    const user = await getCurrentUser();

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6 bg-background/95">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {user?.name} Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Overview of all Department Deliverables and performance metrics. <br/>
                            <strong>Role:</strong> {user?.role}
                        </p>
                    </div>

                    {/*<DepartmentSummaryMetrics data={summaryMetrics} />*/}

                    {/*<div className="grid gap-6 md:grid-cols-2">*/}
                    {/*    <FinancialMetrics />*/}
                    {/*    <div className="grid gap-6 grid-cols-1">*/}
                    {/*        <DeliverableStatus />*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    {/*<SponsorPerformance />*/}

                    {/*<DepartmentPerformance />*/}
                </div>
            </main>
        </div>)
}
export default Page
