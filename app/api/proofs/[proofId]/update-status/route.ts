import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { updateDeliverableStatus } from '@/lib/statusManager';
import {Proof} from "@/index";
import {getCurrentUser} from "@/lib/actions/auth.action";

export async function PATCH(req: NextRequest, { params }: any ) {
    const currentUser = await getCurrentUser();
    if (currentUser?.role === 'viewer') {
        return NextResponse.json(
            { error: 'Permission denied: Viewers cannot modify data.' },
            { status: 403 }
        );
    }
    const { proofId } =  params;

    if (!proofId) {
        return NextResponse.json({ success: false, message: 'Missing proof ID' }, { status: 400 });
    }

    try {
        const { status, reason } = await req.json();

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
        }

        // Step 1: Get the proof
        const proofRef = db.collection('proofs').doc(proofId);
        const proofSnap = await proofRef.get();

        if (!proofSnap.exists) {
            return NextResponse.json({ success: false, message: 'Proof not found' }, { status: 404 });
        }

        const proof = proofSnap.data() as Proof;
        const { deliverableId, userEmail } = proof;

        // Step 2: Update proof status
        await proofRef.update({
            status,
            reason: reason || '',
            reviewedAt: new Date(),
        });

        // Step 3: Update matching department status inside the deliverable
        const deliverableRef = db.collection('deliverables').doc(deliverableId);
        const deliverableSnap = await deliverableRef.get();

        if (!deliverableSnap.exists) {
            return NextResponse.json({ success: false, message: 'Deliverable not found' }, { status: 404 });
        }

        const deliverable = deliverableSnap.data();
        const updatedDepartments = (deliverable?.listDepartments || []).map((dep: any) =>
            dep.userEmail === userEmail
                ? { ...dep, status: status === 'approved' ? 'accepted' : 'rejected' }
                : dep
        );

        await deliverableRef.update({ listDepartments: updatedDepartments });

        // Step 4: Use centralized deliverable/sponsor computation
        await updateDeliverableStatus(deliverableId);

        return NextResponse.json({ success: true, message: 'Proof and related status updated successfully' });
    } catch (error) {
        console.error('Error updating proof and deliverable:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
