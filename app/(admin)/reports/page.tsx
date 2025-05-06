import React from 'react'
import {PageTemplate} from "@/components/layout/PageTemplate";

const Page = () => {
    return (
        <PageTemplate
            title="Financial Report"
            description="Basic info and settings for the current user"
        >
            <div className="space-y-6">
                <div>
                    <h3 className="text-4xl font-extrabold tracking-tight ">Additional Report</h3>
                    <p className="text-muted-foreground ">Get information Accommodation list , food list associated with SponsorShip  </p>
                </div>
            </div>
        </PageTemplate>    )
}
export default Page
