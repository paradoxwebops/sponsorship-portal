// app/api/sponsors/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db, storage } from "@/firebase/admin";
import { v4 as uuidv4 } from "uuid";
import {Sponsor} from "@/app/utils/mockData";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const data = JSON.parse(formData.get('data') as string) as Sponsor;
        const file = formData.get('mou') as File | null;

        let docUrl = "";

        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `mous/${uuidv4()}-${file.name}`;
            const bucket = storage.bucket();
            const fileUpload = bucket.file(fileName);

            await fileUpload.save(buffer, {
                contentType: file.type,
            });

            docUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        }

        const sponsorDoc = await db.collection("sponsors").add({
            ...data,
            docUrl,
            totalValue: (data.cashValue || 0) + (data.inKindValue || 0),
            actualCost: null,
            totalDeliverables: 0,
            completedDeliverables: 0,
            status: "pending",
            estimatedCost: 0,
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