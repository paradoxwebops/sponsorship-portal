import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
import {getCurrentUser} from "@/lib/actions/auth.action";
import {deleteR2Object, getSignedUploadUrl} from "@/lib/r2";

interface Params {
    params: {
        sponsorId: string;
    };
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const id = params.sponsorId;

    const currentUser = await getCurrentUser();
    if (currentUser?.role === 'viewer') {
        return NextResponse.json(
            { error: 'Permission denied: Viewers cannot modify data.' },
            { status: 403 }
        );
    }

    try {
        const formData = await req.formData();
        const rawData = formData.get("data");
        if (!rawData) {
            return NextResponse.json({ success: false, error: "No sponsor data provided" }, { status: 400 });
        }

        const data = JSON.parse(rawData as string);
        const file = formData.get("mou") as File | null;

        // Fetch current doc to get existing docUrl (R2 key)
        const sponsorSnap = await db.collection("sponsors").doc(id).get();
        const sponsorData = sponsorSnap.exists ? sponsorSnap.data() : null;
        const oldDocKey = sponsorData?.docUrl || null;

        // Recalculate totalValue
        const cashValue = data.cashValue || 0;
        const inKindItems = data.inKindItems || [];
        const inKindValue = inKindItems.reduce((sum: number, item: any) => sum + (item.totalValue || 0), 0);
        const totalValue = cashValue + inKindValue;

        const updateData: any = {
            name: data.name,
            legalName: data.legalName,
            sponsorType: data.sponsorType,
            sponsorLevel: data.level,
            priority: data.priority,
            cashValue,
            inKindValue,
            inKindItems,
            events: data.events || [],
            totalValue,
            updatedAt: new Date(),
        };

        if (file) {
            // Delete old file from R2 if exists
            if (oldDocKey) {
                await deleteR2Object(oldDocKey); // must be implemented
            }

            // Upload new file to R2
            const newKey = `sponsor-mous/${Date.now()}-${file.name}`;
            const uploadUrl = await getSignedUploadUrl(newKey, file.type);

            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
            });

            if (!uploadRes.ok) {
                const errText = await uploadRes.text();
                throw new Error(`Upload failed: ${uploadRes.status} - ${errText}`);
            }

            updateData.docUrl = newKey;
        }

        await db.collection("sponsors").doc(id).update(updateData);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("🔥 Error updating sponsor:", error);
        return NextResponse.json({ success: false, error: "Failed to update sponsor" }, { status: 500 });
    }
}