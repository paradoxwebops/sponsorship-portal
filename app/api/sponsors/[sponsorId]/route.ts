import { db, storage } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

interface Params {
    params: {
        id: string;
    };
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const { id } = params;

    try {
        const formData = await req.formData();
        const rawData = formData.get("data");
        if (!rawData) {
            return NextResponse.json({ success: false, error: "No sponsor data provided" }, { status: 400 });
        }

        const data = JSON.parse(rawData as string);
        const file = formData.get("mou") as File | null;

        // Recalculate totalValue
        const cashValue = data.cashValue || 0;
        const inKindItems = data.inKindItems || [];
        const inKindValue = inKindItems.reduce((sum: number, item: any) => sum + (item.totalValue || 0), 0);
        const totalValue = cashValue + inKindValue;

        let updateData: any = {
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
            // Optionally keep estimatedCost, status, etc. if you want
        };

        if (file) {
            // If a new MOU file is uploaded, upload it
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `mous/${id}-${file.name}`;
            const bucket = storage.bucket();
            const fileUpload = bucket.file(fileName);

            await fileUpload.save(buffer, {
                contentType: file.type,
            });

            const docUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            updateData.docUrl = docUrl;
        }

        await db.collection("sponsors").doc(id).update(updateData);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("🔥 Error updating sponsor:", error);
        return NextResponse.json({ success: false, error: "Failed to update sponsor" }, { status: 500 });
    }
}
