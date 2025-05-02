import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function PATCH(req: NextRequest, { params }: { params: { proofId: string } }) {
    const { proofId } = params;

    if (!proofId) {
        return NextResponse.json({ success: false, message: 'Missing proof ID' }, { status: 400 });
    }

    try {
        const { status, reason } = await req.json();

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
        }

        const proofRef = db.collection('proofs').doc(proofId);
        const proofDoc = await proofRef.get();

        if (!proofDoc.exists) {
            return NextResponse.json({ success: false, message: 'Proof not found' }, { status: 404 });
        }

        await proofRef.update({
            status,
            reason: reason || '',
            reviewedAt: new Date(),
        });

        return NextResponse.json({ success: true, message: 'Proof status updated successfully' });
    } catch (error) {
        console.error('Error updating proof status:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
