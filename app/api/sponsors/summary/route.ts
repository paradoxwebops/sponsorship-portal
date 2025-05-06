import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import {Sponsor} from "@/app/utils/mockData";

export async function GET() {
    try {
        const sponsorSnap = await db.collection('sponsors').orderBy('__name__').get();
        const sponsors: Sponsor[] = sponsorSnap.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<Sponsor, 'id'>),
        }));

        if (sponsors.length < 2) {
            return NextResponse.json({ error: 'Not enough data for comparison' }, { status: 400 });
        }

        // Latest and previous sponsor entries
        const latest = sponsors[sponsors.length - 1];
        const previous = sponsors[sponsors.length - 2];

        // Total value and cash/in-kind totals
        const totalCash = sponsors.reduce((sum, s) => sum + (s.cashValue || 0), 0);
        const totalInKind = sponsors.reduce((sum, s) => sum + (s.inKindValue || 0), 0);
        const totalValue = totalCash + totalInKind;

        // Profit and completion
        const totalEstimatedCost = sponsors.reduce((sum, s) => sum + (s.totalEstimatedCost || 0), 0);
        const totalProfit = totalValue - totalEstimatedCost;

        const totalDeliverables = sponsors.reduce((sum, s) => sum + (s.totalDeliverables || 0), 0);
        const completedDeliverables = sponsors.reduce((sum, s) => sum + (s.completedDeliverables || 0), 0);

        // Percentages
        const cashPercentage = totalValue > 0 ? ((totalCash / totalValue) * 100).toFixed(1) : '0.0';
        const inKindPercentage = totalValue > 0 ? ((totalInKind / totalValue) * 100).toFixed(1) : '0.0';
        const profitMargin = totalValue > 0 ? ((totalProfit / totalValue) * 100).toFixed(1) : '0.0';
        const deliverableCompletionRate = totalDeliverables > 0
            ? ((completedDeliverables / totalDeliverables) * 100).toFixed(1)
            : '0.0';

        // Entry-based comparison:
        const latestProfit = (latest.totalValue || 0) - (latest.totalEstimatedCost || 0);
        const previousProfit = (previous.totalValue || 0) - (previous.totalEstimatedCost || 0);
        const profitChange = latestProfit !== 0
            ? (((latestProfit - previousProfit) / Math.abs(previousProfit || 1)) * 100).toFixed(1)
            : '0.0';

        const deliverablesBefore = totalDeliverables - (latest.totalDeliverables || 0);
        const completedBefore = completedDeliverables - (latest.completedDeliverables || 0);
        const completionBefore = deliverablesBefore > 0
            ? (completedBefore / deliverablesBefore) * 100
            : 0;
        const completionChange = (
            parseFloat(deliverableCompletionRate) - completionBefore
        ).toFixed(1);

        return NextResponse.json({
            totalValue,
            cashValue: totalCash,
            inKindValue: totalInKind,
            cashPercentage,
            inKindPercentage,
            totalProfit,
            profitMargin,
            deliverableCompletionRate,
            profitChange,
            completionChange,
        });

    } catch (error) {
        console.error('[SUMMARY_ENTRY_API_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
