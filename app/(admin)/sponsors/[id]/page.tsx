import { notFound } from "next/navigation";
import { db } from "@/firebase/admin";
import { PageTemplate } from "@/components/layout/PageTemplate";
import SponsorDetailsView from "@/components/sponsors/SponsorDetailsView";
import {RouteParams} from "@/index";

// ✅ Strongly typed Sponsor object
interface Sponsor {
    id: string;
    name: string;
    legalName: string;
    sponsorType: any;
    cashValue: number;
    priority: any;
    events: any;
    docUrl: string;
    totalEstimatedCost: number;
    actualCost: number | null;
    totalDeliverables: number;
    completedDeliverables: number;
    status: any;
    createdAt: string | null;
    updatedAt: string | null;
    level: any;
    totalValue: number;
    inKindItems: any[];
    inKindValue: number;
}

// ✅ Helper to normalize Firestore data
function serializeSponsor(docData: any): Sponsor {
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

// ✅ Main server component
export default async function Page({ params }: RouteParams) {
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
        const sponsor = serializeSponsor(rawData);

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
