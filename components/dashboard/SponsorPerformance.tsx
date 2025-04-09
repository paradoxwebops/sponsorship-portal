'use client';


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, ProgressBadge, StatusBadge } from "@/components/ui/DataTable";
import {getSponsorsWithMetrics} from "@/app/utils/mockData";

export function SponsorPerformance() {
    const sponsorsWithMetrics = getSponsorsWithMetrics();

    const columns = [
        {
            header: "Sponsor",
            accessorKey: "name",
        },
        {
            header: "Total Value",
            accessorKey: "totalValue",
            cell: (row: any) => (
                <div>${row.totalValue.toLocaleString()}</div>
            ),
        },
        {
            header: "Cash / In-kind",
            accessorKey: "cashValue",
            cell: (row: any) => (
                <div>${row.cashValue.toLocaleString()} / ${row.inKindValue.toLocaleString()}</div>
            ),
        },
        {
            header: "Est. Cost",
            accessorKey: "estimatedCost",
            cell: (row: any) => (
                <div>${row.estimatedCost.toLocaleString()}</div>
            ),
        },
        {
            header: "Actual Cost",
            accessorKey: "actualCost",
            cell: (row: any) => (
                <div>{row.actualCost ? `$${row.actualCost.toLocaleString()}` : "Pending"}</div>
            ),
        },
        {
            header: "Profit Margin",
            accessorKey: "profitMargin",
            cell: (row: any) => (
                <div>
                    <ProgressBadge value={row.profitMargin} />
                </div>
            ),
        },
        {
            header: "Deliverables",
            accessorKey: "completedDeliverables",
            cell: (row: any) => (
                <div>{row.completedDeliverables} of {row.totalDeliverables} ({row.completionRate}%)</div>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: any) => (
                <StatusBadge status={row.status} />
            ),
        },
    ];

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Sponsor Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <DataTable
                    data={sponsorsWithMetrics}
                    columns={columns}
                    searchable
                    searchPlaceholder="Search sponsors..."
                />
            </CardContent>
        </Card>
    );
}
