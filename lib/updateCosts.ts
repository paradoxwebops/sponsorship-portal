// lib/updateCosts.ts
import { db } from '@/firebase/admin';

/**
 * Recomputes totalEstimatedCost for a sponsor by summing up all cost-based deliverables.
 * Should be called after any cost deliverable is updated or deleted.
 */
export async function updateSponsorTotalCost(sponsorId: string) {
    try {
        const deliverablesSnapshot = await db
            .collection('deliverables')
            .where('sponsorId', '==', sponsorId)
            .where('taskType', '==', 'cost')
            .get();

        let totalEstimatedCost = 0;

        deliverablesSnapshot.forEach(doc => {
            const data = doc.data();
            if (typeof data.estimatedCost === 'number') {
                totalEstimatedCost += data.estimatedCost;
            }
        });

        await db.collection('sponsors').doc(sponsorId).update({
            totalEstimatedCost,
        });

        console.log(`✅ Updated totalEstimatedCost for sponsor ${sponsorId}: ₹${totalEstimatedCost}`);
    } catch (err) {
        console.error('❌ Error updating sponsor total cost:', err);
    }
}

/**
 * Optionally call this when a deliverable is deleted to recalculate sponsor totals.
 */
export async function onDeliverableCostChanged(sponsorId: string) {
    await updateSponsorTotalCost(sponsorId);
}
