// app/sponsors/[id]/page.tsx

import { notFound, redirect } from "next/navigation";
import { PageTemplate } from "@/components/layout/PageTemplate";
import SponsorDetailsView from "@/components/sponsors/SponsorDetailsView";

interface SponsorDetailsProps {
    params: { id: string };
}

export default function SponsorDetailsPage({ params }: SponsorDetailsProps) {
    const { id } = params; // implement async and await causing error

    // Convert id to number
    const sponsorId = parseInt(id, 10);

    // Redirect or show 404 for invalid id
    if (!id || isNaN(sponsorId)) {
        return (
            <PageTemplate
                title="Sponsor Details"
                description="View and manage sponsor details"
            >
                <div className="flex flex-col items-center justify-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Sponsor not found</h2>
                    <p className="text-muted-foreground mb-6">
                        The requested sponsor details could not be found.
                    </p>
                    <a
                        href="/sponsors"
                        className="text-primary hover:underline"
                    >
                        Return to Sponsors
                    </a>
                </div>
            </PageTemplate>
        );
    }

    return (
        <PageTemplate
            title="Sponsor Details"
            description="View and manage sponsor details"
        >
            <SponsorDetailsView
                sponsorId={sponsorId}
                isFullScreen={true}
            />
        </PageTemplate>
    );
}
