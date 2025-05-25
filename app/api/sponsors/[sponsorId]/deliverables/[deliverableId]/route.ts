// app/api/sponsors/[sponsorId]/deliverables/[deliverableId]/route.ts

import { db } from "@/firebase/admin"; // ✅ admin SDK already has everything
import { NextRequest, NextResponse } from "next/server";
import {getCurrentUser} from "@/lib/actions/auth.action";
import {updateSponsorStatus} from "@/lib/statusManager";
import {updateSponsorTotalCost} from "@/lib/updateCosts";
import {deleteR2Object, getSignedUploadUrl} from "@/lib/r2";
//
// interface Params {
//     params: {
//         sponsorId: string;
//         deliverableId: string;
//     };
// }

export async function DELETE(req: NextRequest, context: any
) {
    const currentUser = await getCurrentUser();
    if (currentUser?.role === 'viewer') {
        return NextResponse.json(
            { error: 'Permission denied: Viewers cannot modify data.' },
            { status: 403 }
        );
    }

    const sponsorId = context.params.sponsorId;
    const deliverableId = context.params.deliverableId;

    if (!sponsorId || !deliverableId) {
        return NextResponse.json({ success: false, error: "Missing sponsorId or deliverableId" }, { status: 400 });
    }

    try {
        const sponsorRef = db.collection("sponsors").doc(sponsorId);
        const deliverableRef = db.collection("deliverables").doc(deliverableId);

        let fileKeyToDelete: string | null = null;

        // ✅ Pre-read deliverable before transaction (to avoid side-effects inside transaction)
        const deliverableSnap = await deliverableRef.get();
        if (!deliverableSnap.exists) {
            return NextResponse.json({ success: false, error: "Deliverable does not exist" }, { status: 404 });
        }
        const deliverable = deliverableSnap.data();
        fileKeyToDelete = deliverable?.additionalFileUrl || null;

        await db.runTransaction(async (transaction) => {
            const sponsorSnap = await transaction.get(sponsorRef);
            if (!sponsorSnap.exists) throw new Error("Sponsor does not exist");

            if (deliverable?.status !== "pending" && deliverable?.status !== "overdue") {
                throw new Error("Only pending or overdue tasks can be deleted");
            }

            const sponsor = sponsorSnap.data() || {};
            const estimatedCost = deliverable.estimatedCost || 0;

            transaction.update(sponsorRef, {
                totalEstimatedCost: Math.max((sponsor.totalEstimatedCost || 0) - estimatedCost, 0),
                totalDeliverables: Math.max((sponsor.totalDeliverables || 1) - 1, 0),
            });

            transaction.delete(deliverableRef);
        });

        // ✅ Delete associated R2 file after successful Firestore transaction
        if (fileKeyToDelete) {
            await deleteR2Object(fileKeyToDelete);
        }

        await updateSponsorStatus(sponsorId);
        await updateSponsorTotalCost(sponsorId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("🔥 Error deleting deliverable:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete",
        }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, context: any) {
    const currentUser = await getCurrentUser();
    if (currentUser?.role === 'viewer') {
        return NextResponse.json(
            { error: 'Permission denied: Viewers cannot modify data.' },
            { status: 403 }
        );
    }

    const sponsorId = context.params.sponsorId;
    const deliverableId = context.params.deliverableId;

    if (!sponsorId || !deliverableId) {
        return NextResponse.json({ success: false, error: "Missing sponsorId or deliverableId" }, { status: 400 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const rawData = formData.get("data") as string | null;

        if (!rawData) {
            return NextResponse.json({ success: false, error: "Missing deliverable data" }, { status: 400 });
        }

        const updatedDeliverable = JSON.parse(rawData);
        const sponsorRef = db.collection("sponsors").doc(sponsorId);
        const deliverableRef = db.collection("deliverables").doc(deliverableId);

        await db.runTransaction(async (transaction) => {
            const sponsorSnap = await transaction.get(sponsorRef);
            const deliverableSnap = await transaction.get(deliverableRef);

            if (!sponsorSnap.exists) throw new Error("Sponsor does not exist");
            if (!deliverableSnap.exists) throw new Error("Deliverable does not exist");

            const oldDeliverable = deliverableSnap.data() || {};
            const sponsor = sponsorSnap.data() || {};

            const oldEstimatedCost = oldDeliverable.estimatedCost || 0;
            const newEstimatedCost = updatedDeliverable.estimatedCost || 0;
            const costDifference = newEstimatedCost - oldEstimatedCost;

            // ✅ Update sponsor cost
            transaction.update(sponsorRef, {
                totalEstimatedCost: Math.max((sponsor.totalEstimatedCost || 0) + costDifference, 0),
            });

            // ✅ Update deliverable fields
            transaction.update(deliverableRef, {
                ...updatedDeliverable,
                updatedAt: new Date(),
            });
        });

        await updateSponsorStatus(sponsorId);
        await updateSponsorTotalCost(sponsorId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("🔥 Error updating deliverable:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to update",
        }, { status: 500 });
    }
}
