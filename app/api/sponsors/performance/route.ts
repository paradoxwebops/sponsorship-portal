import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function GET() {
    try {
        const snapshot = await db.collection('sponsors').get();

        const sponsors = snapshot.docs.map(doc => {
            const s = doc.data();

            const totalValue = s.totalValue || 0;
            const cashValue = s.cashValue || 0;
            const inKindValue = s.inKindValue || 0;
            const estCost = s.totalEstimatedCost || 0;

            const profitMargin = totalValue > 0
                ? (((totalValue - estCost) / totalValue) * 100)
                : 0;

            const totalDeliverables = s.totalDeliverables || 0;
            const completedDeliverables = s.completedDeliverables || 0;
            const completionRate = totalDeliverables > 0
                ? (completedDeliverables / totalDeliverables) * 100
                : 0;

            return {
                name: s.name || 'Unnamed Sponsor',
                totalValue,
                cashValue,
                inKindValue,
                estimatedCost: estCost,
                profitMargin: parseFloat(profitMargin.toFixed(2)),
                deliverables: {
                    completed: completedDeliverables,
                    total: totalDeliverables,
                    completionRate: parseFloat(completionRate.toFixed(2)),
                },
                status: s.status || 'unknown'
            };
        });

        return NextResponse.json({ sponsors });

    } catch (error) {
        console.error('[SPONSOR_PERFORMANCE_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
