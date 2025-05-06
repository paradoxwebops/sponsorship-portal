import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { PageTemplate } from '@/components/layout/PageTemplate';

const Page = async () => {
    const user = await getCurrentUser();

    if (!user || user.role !== 'finance') {
        redirect('/sign-in');
    }

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
    );
};

export default Page;
