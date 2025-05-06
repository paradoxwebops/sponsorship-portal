import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
import {getCurrentUser} from "@/lib/actions/auth.action";
import {updateSponsorStatus} from "@/lib/statusManager";
import {updateSponsorTotalCost} from "@/lib/updateCosts";
import {getSignedUploadUrl} from "@/lib/r2";

interface Params {
    params: { sponsorId: string }; // <-- fixed here
}

export async function GET(req: NextRequest, { params }: any) {
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
export async function POST(req: NextRequest, { params }: any) {
    const currentUser = await getCurrentUser();
    if (currentUser?.role === "viewer") {
        return NextResponse.json(
            { error: "Permission denied: Viewers cannot modify data." },
            { status: 403 }
        );
    }

    const sponsorId = params.sponsorId;
    if (!sponsorId) {
        return NextResponse.json({ error: "Missing sponsorId" }, { status: 400 });
    }

    try {
        const formData = await req.formData();

        const deliverableRaw = formData.get("data") as string | null;
        const file = formData.get("file") as File | null;

        if (!deliverableRaw) {
            return NextResponse.json({ error: "Missing deliverable data" }, { status: 400 });
        }

        const deliverable = JSON.parse(deliverableRaw);
        let additionalFileUrl = "";

        if (file) {
            const key = `deliverable-files/${Date.now()}-${file.name}`;
            const uploadUrl = await getSignedUploadUrl(key, file.type);

            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
            });

            if (!uploadRes.ok) {
                const errText = await uploadRes.text();
                throw new Error(`Upload failed: ${uploadRes.status} - ${errText}`);
            }

            additionalFileUrl = key;
        }

        // Step 1: Add the deliverable document
        const deliverableRef = await db.collection("deliverables").add({
            ...deliverable,
            sponsorId,
            additionalFileUrl, // ✅ Save R2 file key here
            createdAt: new Date(),
        });

        // Step 2: Update deliverable document with its own ID
        await deliverableRef.update({
            id: deliverableRef.id,
        });

        // Step 3: Update sponsor info in a transaction
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

        await updateSponsorStatus(sponsorId);
        await updateSponsorTotalCost(sponsorId);

        return NextResponse.json({ success: true, deliverableId: deliverableRef.id });
    } catch (error) {
        console.error("🔥 Error creating deliverable:", error);
        return NextResponse.json({ error: "Failed to create deliverable" }, { status: 500 });
    }
}
