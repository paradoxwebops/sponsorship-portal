import { notFound } from "next/navigation";
import { db } from "@/firebase/admin";
import { PageTemplate } from "@/components/layout/PageTemplate";
import SponsorDetailsView from "@/components/sponsors/SponsorDetailsView";
import { Sponsor } from "@/app/utils/mockData";

interface SponsorDetailsProps {
    params: { id: string };
}

// 🔥 Helper function to serialize timestamps
function serializeSponsor(docData: any): {
    totalValue: number;
    totalDeliverables: number;
    sponsorType: any;
    level: string;
    inKindValue: number;
    cashValue: any;
    totalEstimatedCost: number;
    priority: any;
    legalName: any;
    createdAt: string | null;
    completedDeliverables: number;
    sponsorLevel: string;
    inKindItems: any[];
    name: any;
    docUrl: string;
    id: any;
    events: any[];
    actualCost: any;
    status: any;
    updatedAt: string | null
} {
    return {
        id: docData.id,
        name: docData.name,
        legalName: docData.legalName,
        sponsorType: docData.sponsorType,
        cashValue: docData.cashValue,
        priority: docData.priority,
        events: docData.events || [],
        docUrl: docData.docUrl || "",
        totalEstimatedCost: docData.totalEstimatedCost || 0,
        actualCost: docData.actualCost ?? null,
        totalDeliverables: docData.totalDeliverables || 0,
        completedDeliverables: docData.completedDeliverables || 0,
        status: docData.status,
        createdAt: docData.createdAt?.toDate().toISOString() || null,
        updatedAt: docData.updatedAt?.toDate().toISOString() || null,
        level: docData.level || "",
        totalValue: docData.totalValue || 0,
        inKindItems: docData.inKindItems || [],
        inKindValue: docData.inKindValue || 0,
    };
}

export default async function SponsorDetailsPage({ params }: SponsorDetailsProps) {
    const { id } = await params;

    if (!id) {
        notFound();
    }

    try {
        const doc = await db.collection("sponsors").doc(id).get();

        if (!doc.exists) {
            notFound();
        }

        const rawData = { id: doc.id, ...doc.data() };
        const sponsor = serializeSponsor(rawData); // ✅ clean timestamps

        return (
            <PageTemplate
                title={`Sponsor: ${sponsor.name || "Details"}`}
                description="View and manage sponsor details"
            >
                <SponsorDetailsView sponsor={sponsor} isFullScreen={true} />
            </PageTemplate>
        );
    } catch (error) {
        console.error("🔥 Error fetching sponsor details:", error);
        notFound();
    }
}
