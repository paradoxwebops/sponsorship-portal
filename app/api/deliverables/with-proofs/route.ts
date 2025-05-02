// app/api/deliverables/with-proofs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function GET(req: NextRequest) {
    try {
        const snapshot = await db.collection('deliverables')
            .where('proofSubmissions', '!=', null) // Firestore won't filter by array length
            .get();

        const results: any[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            const proofSubmissions = data.proofSubmissions || [];

            proofSubmissions.forEach((submission: any) => {
                results.push({
                    deliverableId: doc.id,
                    deliverableTitle: data.title,
                    deliverableDueDate: data.dueDate,
                    deliverableStatus: data.status,
                    deliverablePriority: data.priority,
                    proofSubmission: submission,
                    userName: submission.userName,
                    userEmail: submission.userEmail,
                    proofFileUrl: submission.proofFileUrl,
                    timestamp: submission.created_at,
                    proofMessage: submission.proofMessage
                });
            });
        });

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error fetching proof submissions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
