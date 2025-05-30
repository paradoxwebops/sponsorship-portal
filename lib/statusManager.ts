import { db } from '@/firebase/admin';

export async function updateDeliverableStatus(deliverableId: string): Promise<void> {
    const deliverableRef = db.collection('deliverables').doc(deliverableId);
    const snap = await deliverableRef.get();
    if (!snap.exists) return;

    const deliverable = snap.data();
    const listDepartments = deliverable?.listDepartments || [];

    const allAccepted = listDepartments.length > 0 && listDepartments.every((dep: any) => dep.status === 'accepted');
    const anyRejectedOrPending = listDepartments.some((dep: any) => dep.status === 'rejected' || !dep.status);

    let newStatus = 'in_progress';
    if (allAccepted) newStatus = 'completed';

    await deliverableRef.update({ status: newStatus });

    // Also update sponsor status if applicable
    if (deliverable?.sponsorId) {
        await updateSponsorStatus(deliverable.sponsorId);
    }
}

export async function updateSponsorStatus(sponsorId: string): Promise<void> {
    const snapshot = await db
        .collection('deliverables')
        .where('sponsorId', '==', sponsorId)
        .get();

    let completedCount = 0;
    let totalCount = snapshot.docs.length;

    for (const doc of snapshot.docs) {
        if (doc.data().status === 'completed') {
            completedCount++;
        }
    }

    const allCompleted = totalCount > 0 && completedCount === totalCount;

    const sponsorRef = db.collection('sponsors').doc(sponsorId);
    await sponsorRef.update({
        status: allCompleted ? 'completed' : 'in_progress',
        completedDeliverables: completedCount,
    });
}
