import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

interface Params {
    params: {
        id: string;
    };
}

// GET all Deliverables for a Sponsor
export async function GET(req: NextRequest, { params }: Params) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ deliverables: [] }, { status: 400 });
    }

    try {
        const snapshot = await db
            .collection("sponsors")
            .doc(id)
            .collection("deliverables") // ✅ subcollection
            .get();

        const deliverables = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ deliverables });
    } catch (error) {
        console.error("🔥 Error fetching deliverables:", error);
        return NextResponse.json({ deliverables: [] }, { status: 500 });
    }
}
