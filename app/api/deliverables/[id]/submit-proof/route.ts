// app/api/deliverables/[id]/submit-proof/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const deliverableId = params.id;

    if (!deliverableId) {
        return NextResponse.json({ success: false, message: 'Missing deliverable ID' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const proofSubmission = body.proofSubmission as ProofSubmission;

        if (!proofSubmission) {
            return NextResponse.json({ success: false, message: 'Missing proof submission data' }, { status: 400 });
        }

        const deliverableRef = db.collection('deliverables').doc(deliverableId);

        // Check if deliverable exists
        const docSnapshot = await deliverableRef.get();
        if (!docSnapshot.exists) {
            return NextResponse.json({ success: false, message: 'Deliverable not found' }, { status: 404 });
        }

        // Append new proofSubmission
        await deliverableRef.update({
            proofSubmissions: db.FieldValue.arrayUnion(proofSubmission)
        });

        return NextResponse.json({ success: true, message: 'Proof submitted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error submitting proof:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
