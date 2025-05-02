// /app/api/upload-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSignedUploadUrl } from "@/lib/r2";

export async function POST(req: NextRequest) {
    const data = await req.formData();
    const file = data.get("file") as File;
    const purpose = data.get("purpose") as string;
    const userFileName = data.get("fileName") as string;

    if (!file || !purpose || !userFileName) {
        return NextResponse.json({ error: "Missing file or metadata" }, { status: 400 });
    }

    const folderMap: Record<string, string> = {
        mou: "sponsor-mous",
        deliverable: "deliverable-files",
        proof: "proofs",
    };

    const prefix = folderMap[purpose] || "misc";
    const key = `${prefix}/${Date.now()}-${userFileName}`;

    try {
        const url = await getSignedUploadUrl(key, file.type);

        const uploadRes = await fetch(url, {
            method: "PUT",
            body: file,
        });

        if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            throw new Error(`Upload failed: ${uploadRes.status} - ${errText}`);
        }

        const fileUrl = url.split("?")[0];
        return NextResponse.json({ success: true, fileUrl });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
