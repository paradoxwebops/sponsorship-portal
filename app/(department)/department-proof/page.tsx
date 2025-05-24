'use client';

import React, { useEffect, useState } from 'react';
import { PageTemplate } from "@/components/layout/PageTemplate";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import {ProofSubmissionForm} from "@/components/department/ProofSubmissionForm";

const DepartmentProofPage = () => {
    const [deliverables, setDeliverables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null); // <-- New

    const deliverableColumns = [
        {
            header: "Company",
            accessorKey: "sponsorName",
        },
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
            header: "Status",
            accessorKey: "proofStatus",
            cell: (row: any) => (
                <Badge
                    className={
                        row.proofStatus === "approved"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : row.proofStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : row.proofStatus === "rejected"
                                    ? "bg-red-100 text-red-800 hover:bg-red-100"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                >
                    {row.proofStatus
                        ? row.proofStatus.charAt(0).toUpperCase() + row.proofStatus.slice(1)
                        : "Not Submitted"}
                </Badge>
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

    const fetchDeliverables = async () => {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            console.error('User not logged in');
            return;
        }

        setUser(currentUser); // Save user in state

        // Map subdepartment roles to department email
        const roleToDeptEmail: Record<string, string> = {
            culturals: "culturals@iitmparadox.org",
            technicals: "technicals@iitmparadox.org",
            sports: "sports@iitmparadox.org",
        };
        const fetchEmail = roleToDeptEmail[currentUser.role] || currentUser.email;

        try {
            const response = await fetch(`/api/deliverables?email=${encodeURIComponent(fetchEmail)}`);
            const data = await response.json();
            setDeliverables(data);
        } catch (error) {
            console.error('Failed to fetch deliverables:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliverables();
    }, []);

    const refetchDeliverables = () => {
        setLoading(true);
        fetchDeliverables();
    };

    return (
        <PageTemplate
            title="Submit Proof"
            description="Submit proof for your assigned deliverables."
        >
            <div>
                <h3 className="text-4xl font-extrabold tracking-tight">Deliverables List </h3>
                <p className="text-muted-foreground">Add Proof to your deliverables accordingly ...</p>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <DataTable
                    data={deliverables}
                    columns={deliverableColumns}
                    searchable
                    accordionMode
                    renderAccordionContent={(deliverable: any) => (
                        <div className="p-4 space-y-4">
                            <ProofSubmissionForm deliverable={deliverable} user={user} onSuccess={refetchDeliverables} />
                        </div>
                    )}
                />
            )}
        </PageTemplate>
    );
};

export default DepartmentProofPage;
