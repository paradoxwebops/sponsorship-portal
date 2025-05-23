import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { Deliverable } from "@/index";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    try {
        const deliverablesRef = db.collection('deliverables')
            .where('taskType', '==', 'standard'); // ✅ filter taskType here

        const snapshot = await deliverablesRef.get();

        const deliverablesWithProofs: any[] = [];

        for (const doc of snapshot.docs) {
            const data = doc.data() as Deliverable;

            // ✅ filter based on department membership
            const matchingDepartment = data.listDepartments.find(dep => dep.userEmail === email);
            if (!matchingDepartment) continue;

            const deliverableId = doc.id;

            const proofSnap = await db.collection('proofs')
                .where('deliverableId', '==', deliverableId)
                .where('userEmail', '==', email)
                .limit(1)
                .get();

            const proofDoc = proofSnap.empty ? null : proofSnap.docs[0];

            deliverablesWithProofs.push({
                ...data,
                id: deliverableId,
                proofId: proofDoc?.id || null,
                proofStatus: proofDoc?.data()?.status || null,
                proofReason: proofDoc?.data()?.reason || null,
                proofReviewedAt: proofDoc?.data()?.reviewedAt || null,
                proofFileUrls: proofDoc?.data()?.proofFileUrls || [],
                proofFileUrl: proofDoc?.data()?.proofFileUrl || null,
                proofMessage: proofDoc?.data()?.proofMessage || null,
            });
        }

        return NextResponse.json(deliverablesWithProofs, { status: 200 });
    } catch (error) {
        console.error('Error fetching deliverables with proof:', error);
        return NextResponse.json({ error: 'Failed to fetch deliverables' }, { status: 500 });
    }
}
