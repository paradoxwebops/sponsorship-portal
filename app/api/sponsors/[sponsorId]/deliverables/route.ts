import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

interface Params {
    params: { sponsorId: string }; // <-- fixed here
}

export async function GET(req: NextRequest, { params }: Params) {
    const sponsorId = params.sponsorId; // <-- fixed here
    if (!sponsorId) return NextResponse.json({ error: "Missing sponsorId" }, { status: 400 });

    try {
        const snapshot = await db.collection("deliverables").where("sponsorId", "==", sponsorId).get();
        const deliverables = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ deliverables });
    } catch (error) {
        console.error("🔥 Error fetching deliverables:", error);
        return NextResponse.json({ error: "Failed to fetch deliverables" }, { status: 500 });
    }
}
export async function POST(req: NextRequest, { params }: Params) {
    const sponsorId = params.sponsorId;
    if (!sponsorId) return NextResponse.json({ error: "Missing sponsorId" }, { status: 400 });

    try {
        const deliverable = await req.json();

        // Step 1: Add the document
        const deliverableRef = await db.collection("deliverables").add({
            ...deliverable,
            sponsorId,
            createdAt: new Date(),
        });

        // Step 2: Now update the document with its own ID
        await deliverableRef.update({
            id: deliverableRef.id, // Save Firestore document ID inside the document
        });

        // Step 3: Update sponsor data
        const sponsorRef = db.collection("sponsors").doc(sponsorId);
        await db.runTransaction(async (transaction) => {
            const sponsorSnap = await transaction.get(sponsorRef);
            if (!sponsorSnap.exists) throw new Error("Sponsor not found");

            const sponsorData = sponsorSnap.data() || {};
            transaction.update(sponsorRef, {
                totalEstimatedCost: (sponsorData.totalEstimatedCost || 0) + (deliverable.estimatedCost || 0),
                totalDeliverables: (sponsorData.totalDeliverables || 0) + 1,
            });
        });

        return NextResponse.json({ success: true, deliverableId: deliverableRef.id });
    } catch (error) {
        console.error("🔥 Error creating deliverable:", error);
        return NextResponse.json({ error: "Failed to create deliverable" }, { status: 500 });
    }
}