import { NextRequest, NextResponse } from "next/server";
import { getSignedDownloadUrl } from "@/lib/r2";

export async function POST(req: NextRequest) {
    const { fileKey } = await req.json(); // full key like "proofs/xyz.pdf"

    try {
        const url = await getSignedDownloadUrl(fileKey);
        return NextResponse.json({ url });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 });
    }
}
