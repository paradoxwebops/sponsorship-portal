import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import {Deliverable} from "@/app/utils/mockData";


// quick job for future dev , Make listDepartmentEmails,

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    try {
        const deliverablesRef = db.collection('deliverables');
        const snapshot = await deliverablesRef.get();

        const deliverables: Deliverable[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data() as Deliverable;

            // 🔥 Check if any listDepartments object has matching userEmail
            const hasUserEmail = data.listDepartments.some(dep => dep.userEmail === email);

            if (hasUserEmail) {
                deliverables.push({
                    ...data,
                    id: doc.id,
                });
            }
        });

        return NextResponse.json(deliverables, { status: 200 });
    } catch (error) {
        console.error('Error fetching deliverables:', error);
        return NextResponse.json({ error: 'Failed to fetch deliverables' }, { status: 500 });
    }
}
