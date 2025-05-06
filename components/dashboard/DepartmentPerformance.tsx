'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, ProgressBadge } from "@/components/ui/DataTable";

interface DepartmentMetrics {
    department: string;
    assigned: number;
    completed: number;
    remaining: number;
    completionRate: number;
    onTimeRate: number;
}

export function DepartmentPerformance() {
    const [departments, setDepartments] = useState<DepartmentMetrics[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDepartments() {
            const res = await fetch('/api/sponsors/department-performance');
            const json = await res.json();
            setDepartments(json.departments);
            setLoading(false);
        }

        fetchDepartments();
    }, []);

    const columns = [
        {
            header: "Department",
            accessorKey: "department",
        },
        {
            header: "Assigned",
            accessorKey: "assigned",
            className: "text-right",
        },
        {
            header: "Completed",
            accessorKey: "completed",
            className: "text-right",
        },
        {
            header: "Remaining",
            accessorKey: "remaining",
            className: "text-right",
        },
        {
            header: "Completion Rate",
            accessorKey: "completionRate",
            cell: (row: any) => (
                <div className="text-right">
                    <ProgressBadge value={row.completionRate} />
                </div>
            ),
            className: "text-right",
        },
        {
            header: "On-time Rate",
            accessorKey: "onTimeRate",
            cell: (row: any) => (
                <div className="text-right">
                    <ProgressBadge value={row.onTimeRate} />
                </div>
            ),
            className: "text-right",
        }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Department Performance</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                ) : (
                    <DataTable
                        data={departments}
                        columns={columns}
                        searchable
                        searchPlaceholder="Search departments..."
                    />
                )}
            </CardContent>
        </Card>
    );
}
