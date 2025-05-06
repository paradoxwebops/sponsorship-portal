import { PageTemplate } from '@/components/layout/PageTemplate'
import React from 'react'

const Page = () => {
    return (
        <PageTemplate
            title="Financial Report"
            description="Basic info and settings for the current user"
        >
            <div className="space-y-6">
                <div>
                    <h3 className="text-4xl font-extrabold tracking-tight ">Financial Report</h3>
                    <p className="text-muted-foreground ">Information about all the Cost associated Deliverables </p>
                </div>
            </div>
        </PageTemplate>
    )
}
export default Page
