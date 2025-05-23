import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function GET(req: NextRequest) {
    try {
        const proofSnapshot = await db.collection('proofs').get();
        const results: any[] = [];

        for (const proofDoc of proofSnapshot.docs) {
            const proof = proofDoc.data();
            const deliverableId = proof.deliverableId;
            const userId = proof.userId;

            // Fetch deliverable info
            let deliverableData = null;
            let sponsorData = null;

            try {
                const deliverableDoc = await db.collection('deliverables').doc(deliverableId).get();
                if (deliverableDoc.exists) {
                    deliverableData = deliverableDoc.data();

                    // Fetch sponsor info using deliverable.sponsorId
                    const sponsorId = deliverableData?.sponsorId;
                    if (sponsorId) {
                        const sponsorDoc = await db.collection('sponsors').doc(sponsorId).get();
                        if (sponsorDoc.exists) {
                            sponsorData = sponsorDoc.data();
                        }
                    }
                }
            } catch (err) {
                console.warn(`Error fetching deliverable or sponsor for proof ${proofDoc.id}:`, err);
            }

            results.push({
                proofId: proofDoc.id,
                deliverableId,
                deliverableTitle: deliverableData?.title || null,
                deliverableDueDate: deliverableData?.dueDate || null,
                deliverableStatus: deliverableData?.status || null,
                deliverablePriority: deliverableData?.priority || null,
                sponsorId: deliverableData?.sponsorId || null,
                sponsorName: sponsorData?.name || null,
                userId,
                userName: proof.userName,
                userEmail: proof.userEmail,
                proofFileUrls: proof.proofFileUrls || [],
                proofFileUrl: proof.proofFileUrl || null,
                proofMessage: proof.proofMessage,
                status: proof.status,
                timestamp: proof.timestamp,
            });
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error fetching proofs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
