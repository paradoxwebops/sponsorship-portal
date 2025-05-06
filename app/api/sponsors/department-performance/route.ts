import { db } from '@/firebase/admin';
import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

type DepartmentPerformance = {
    department: string;
    assigned: number;
    completed: number;
    remaining: number;
    completionRate: number;
    onTimeRate: number;
};

export async function GET() {
    try {
        const deliverableSnap = await db.collectionGroup('deliverables').get();

        const departmentStats: Record<string, {
            assigned: number;
            completed: number;
            onTime: number;
        }> = {};

        for (const doc of deliverableSnap.docs) {
            const data = doc.data();

            const dueDate = data.dueDate instanceof Timestamp
                ? data.dueDate.toDate()
                : new Date(data.dueDate);

            const completedDate = data.completedDate instanceof Timestamp
                ? data.completedDate.toDate()
                : data.completedDate
                    ? new Date(data.completedDate)
                    : null;

            const listDepartments = data.listDepartments || [];

            for (const dept of listDepartments) {
                const deptName = dept.userName || dept.userEmail || dept.userId;
                const status = (dept.status || '').toLowerCase();

                if (!departmentStats[deptName]) {
                    departmentStats[deptName] = {
                        assigned: 0,
                        completed: 0,
                        onTime: 0,
                    };
                }

                departmentStats[deptName].assigned += 1;

                if (status === 'completed' || status === 'accepted') {
                    departmentStats[deptName].completed += 1;

                    if (completedDate && dueDate && completedDate <= dueDate) {
                        departmentStats[deptName].onTime += 1;
                    }
                }
                // else: considered remaining
            }
        }

        const response: DepartmentPerformance[] = Object.entries(departmentStats).map(
            ([dept, stats]) => {
                const remaining = stats.assigned - stats.completed;
                const completionRate = stats.assigned > 0
                    ? Math.round((stats.completed / stats.assigned) * 100)
                    : 0;
                const onTimeRate = stats.completed > 0
                    ? Math.round((stats.onTime / stats.completed) * 100)
                    : 0;

                return {
                    department: dept,
                    assigned: stats.assigned,
                    completed: stats.completed,
                    remaining,
                    completionRate,
                    onTimeRate,
                };
            }
        );

        return NextResponse.json({ departments: response });

    } catch (error) {
        console.error('[DEPARTMENT_PERFORMANCE_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
