// app/api/sponsors/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";

import {getCurrentUser} from "@/lib/actions/auth.action";
import {getSignedUploadUrl} from "@/lib/r2";
import {Sponsor} from "@/index";

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (currentUser?.role === 'viewer') {
            return NextResponse.json(
                { error: 'Permission denied: Viewers cannot modify data.' },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const data = JSON.parse(formData.get('data') as string) as Sponsor;
        const file = formData.get('mou') as File | null;

        let r2Key = "";

        if (file) {
            r2Key = `sponsor-mous/${Date.now()}-${file.name}`;
            const uploadUrl = await getSignedUploadUrl(r2Key, file.type);

            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
            });

            if (!uploadRes.ok) {
                const errText = await uploadRes.text();
                throw new Error(`Upload failed: ${uploadRes.status} - ${errText}`);
            }

            // Do NOT try to use url.split("?")[0], just save the key.
        }

        const sponsorDoc = await db.collection("sponsors").add({
            ...data,
            docUrl: r2Key, // Save R2 key only
            totalValue: (data.cashValue || 0) + (data.inKindValue || 0),
            actualCost: null,
            totalDeliverables: 0,
            completedDeliverables: 0,
            status: "pending",
            totalEstimatedCost: 0,
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, id: sponsorDoc.id });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: "Failed to add sponsors" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const snapshot = await db.collection("sponsors").get();
        const sponsors = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ sponsors });
    } catch (error) {
        console.error("Error fetching sponsors:", error);
        return NextResponse.json({ sponsors: [] }, { status: 500 });
    }
}