import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function PATCH(
    req: NextRequest,
    context: { params: any } // <-- only this works in Next 15 build on Vercel
) {
    const deliverableId = context.params.id;
    if (!deliverableId) {
        return NextResponse.json({ success: false, message: 'Missing deliverable ID' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { user, proofFileUrl, proofMessage, status } = body;

        if (!user || !proofFileUrl || !proofMessage || !status) {
            return NextResponse.json({ success: false, message: 'Missing proof submission fields' }, { status: 400 });
        }

        const deliverableRef = db.collection('deliverables').doc(deliverableId);
        const docSnapshot = await deliverableRef.get();
        if (!docSnapshot.exists) {
            return NextResponse.json({ success: false, message: 'Deliverable not found' }, { status: 404 });
        }

        const newProofSubmission = {
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            proofFileUrl,
            proofMessage,
            timestamp: new Date(),
            deliverableId,
            status,
        };

        await db.collection('proofs').add(newProofSubmission);

        return NextResponse.json({ success: true, message: 'Proof submitted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error submitting proof:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
