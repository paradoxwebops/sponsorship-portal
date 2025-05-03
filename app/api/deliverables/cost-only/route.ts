import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { Deliverable } from "@/index";

export async function GET(req: NextRequest) {
    try {
        const snapshot = await db.collection('deliverables')
            .where('taskType', '==', 'cost')
            .get();

        const costDeliverables: any[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data() as Deliverable;
            costDeliverables.push({
                ...data,
                id: doc.id,
            });
        });

        return NextResponse.json(costDeliverables, { status: 200 });
    } catch (error) {
        console.error('Error fetching cost deliverables:', error);
        return NextResponse.json({ error: 'Failed to fetch cost deliverables' }, { status: 500 });
    }
}
