'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, ProgressBadge, StatusBadge } from "@/components/ui/DataTable";

interface SponsorWithMetrics {
    name: string;
    totalValue: number;
    cashValue: number;
    inKindValue: number;
    estimatedCost: number;
    profitMargin: number;
    deliverables: {
        completed: number;
        total: number;
        completionRate: number;
    };
    status: string;
}

export function SponsorPerformance() {
    const [sponsors, setSponsors] = useState<SponsorWithMetrics[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const res = await fetch('/api/sponsors/performance');
            const json = await res.json();
            setSponsors(json.sponsors);
            setLoading(false);
        }

        fetchData();
    }, []);

    const columns = [
        {
            header: "Sponsor",
            accessorKey: "name",
        },
        {
            header: "Total Value",
            accessorKey: "totalValue",
            cell: (row: any) => (
                <div>₹{row.totalValue.toLocaleString()}</div>
            ),
        },
        {
            header: "Cash / In-kind",
            accessorKey: "cashValue",
            cell: (row: any) => (
                <div>₹{row.cashValue.toLocaleString()} / ₹{row.inKindValue.toLocaleString()}</div>
            ),
        },
        {
            header: "Est. Cost",
            accessorKey: "estimatedCost",
            cell: (row: any) => (
                <div>₹{row.estimatedCost.toLocaleString()}</div>
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
            accessorKey: "deliverables",
            cell: (row: any) => (
                <div>{row.deliverables.completed} of {row.deliverables.total} ({row.deliverables.completionRate.toFixed(0)}%)</div>
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
                {loading ? (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                ) : (
                    <DataTable
                        data={sponsors}
                        columns={columns}
                        searchable
                        searchPlaceholder="Search sponsors..."
                    />
                )}
            </CardContent>
        </Card>
    );
}
