'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { DataTable } from "@/components/ui/DataTable";
import {ProofSubmissionForm} from "@/components/department/ProofSubmissionForm";
import {AddCostForm} from "@/components/finance/AddCostForm";

const Page = () => {
    const [deliverables, setDeliverables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const deliverableColumns = [
        {
            header: "Task",
            accessorKey: "title",
        },
        {
            header: "Type",
            accessorKey: "taskType",
            cell: (row: any) => (
                <Badge
                    variant="outline"
                    className={
                        row.taskType === "standard"
                            ? "border-blue-500 text-blue-500"
                            : "border-green-500 text-green-500"
                    }
                >
                    {row.taskType === "standard" ? "Standard" : "Cost-Based"}
                </Badge>
            ),
        },
        {
            header: "Due Date",
            accessorKey: "dueDate",
            cell: (row: any) => (
                <span>
                    {typeof row.dueDate === 'string'
                        ? new Date(row.dueDate).toLocaleDateString()
                        : new Date(row.dueDate.seconds * 1000).toLocaleDateString()}
                </span>
            ),
        },
        {
            header: "Priority",
            accessorKey: "priority",
            cell: (row: any) => (
                <Badge
                    variant="outline"
                    className={
                        row.priority === "high"
                            ? "border-red-500 text-red-500"
                            : row.priority === "medium"
                                ? "border-yellow-500 text-yellow-500"
                                : "border-green-500 text-green-500"
                    }
                >
                    {row.priority}
                </Badge>
            ),
        },
    ];

    useEffect(() => {
        const fetchDeliverables = async () => {
            try {
                const response = await fetch(`/api/deliverables/cost-only`);
                const data = await response.json();
                setDeliverables(data);
            } catch (error) {
                console.error('Failed to fetch cost deliverables:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeliverables();
    }, []);

    return (
        <PageTemplate
            title="Update Cost Deliverables"
            description="Review and manage all cost-based deliverables assigned."
        >
            <div>
                <h3 className="text-4xl font-extrabold tracking-tight">Cost-Based Deliverables</h3>
                <p className="text-muted-foreground">Monitor and update deliverables that involve associated costs.</p>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <DataTable
                    data={deliverables}
                    columns={deliverableColumns}
                    searchable
                    accordionMode
                    renderAccordionContent={(row) => (
                        <div className="p-4 space-y-4">
                            <h4 className="text-lg font-semibold">Submit Cost for: {row.title}</h4>
                            <AddCostForm deliverable={row} />
                        </div>
                    )}
                />
            )}
        </PageTemplate>
    );
};

export default Page;
