// app/api/sponsors/[sponsorId]/deliverables/[deliverableId]/route.ts

import { db } from "@/firebase/admin"; // ✅ admin SDK already has everything
import { NextRequest, NextResponse } from "next/server";

interface Params {
    params: {
        sponsorId: string;
        deliverableId: string;
    };
}

export async function DELETE(req: NextRequest, context: Params) {
    const sponsorId = context.params.sponsorId;
    const deliverableId = context.params.deliverableId;

    if (!sponsorId || !deliverableId) {
        return NextResponse.json({ success: false, error: "Missing sponsorId or deliverableId" }, { status: 400 });
    }

    try {
        const sponsorRef = db.collection("sponsors").doc(sponsorId);
        const deliverableRef = db.collection("deliverables").doc(deliverableId);

        await db.runTransaction(async (transaction) => {
            const deliverableSnap = await transaction.get(deliverableRef);
            const sponsorSnap = await transaction.get(sponsorRef);

            if (!deliverableSnap.exists) throw new Error("Deliverable does not exist");
            if (!sponsorSnap.exists) throw new Error("Sponsor does not exist");

            const deliverable = deliverableSnap.data() || {};
            const sponsor = sponsorSnap.data() || {};

            if (deliverable.status !== "pending" && deliverable.status !== "overdue") {
                throw new Error("Only pending or overdue tasks can be deleted");
            }

            const estimatedCost = deliverable.estimatedCost || 0;

            transaction.update(sponsorRef, {
                totalEstimatedCost: Math.max((sponsor.totalEstimatedCost || 0) - estimatedCost, 0),
                totalDeliverables: Math.max((sponsor.totalDeliverables || 1) - 1, 0),
            });

            transaction.delete(deliverableRef);
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("🔥 Error deleting deliverable:", error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Failed to delete" }, { status: 500 });
    }
}
