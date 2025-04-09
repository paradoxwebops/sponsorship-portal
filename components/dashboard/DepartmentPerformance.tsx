// components/DepartmentPerformance.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {DataTable, ProgressBadge} from "@/components/ui/DataTable";
import { Clock } from "lucide-react";
import {getDepartmentsWithMetrics} from "@/app/utils/mockData";

export function DepartmentPerformance() {
    const departmentsWithMetrics = getDepartmentsWithMetrics();

    const columns = [
        {
            header: "Department",
            accessorKey: "name",
        },
        {
            header: "Assigned",
            accessorKey: "totalAssigned",
            className: "text-right",
        },
        {
            header: "Completed",
            accessorKey: "totalCompleted",
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
        },
        {
            header: "Avg. Time (days)",
            accessorKey: "avgCompletionTime",
            cell: (row: any) => (
                <div className="flex items-center justify-end">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    {row.avgCompletionTime}
                </div>
            ),
            className: "text-right",
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Department Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <DataTable
                    data={departmentsWithMetrics}
                    columns={columns}
                    searchable
                    searchPlaceholder="Search departments..."
                />
            </CardContent>
        </Card>
    );
}
