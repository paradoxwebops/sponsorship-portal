'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { DataTable } from "@/components/ui/DataTable";
import { AddCostForm } from "@/components/finance/AddCostForm";
import { useRouter } from "next/navigation";
import { User } from '@/index';

const Page = () => {
    const [user, setUser] = useState<User | null>(null);
    const [authChecking, setAuthChecking] = useState(true); // 👈 auth loading
    const [deliverables, setDeliverables] = useState<any[]>([]);
    const [loading, setLoading] = useState(false); // 👈 data loading
    const router = useRouter();

    // ✅ Step 1: Fetch user and redirect if needed
    useEffect(() => {
        async function fetchUser() {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    router.push("/sign-in");
                } else if (currentUser.role !== "finance") {
                    router.push("/department-dashboard");
                } else {
                    setUser(currentUser);
                }
            } catch (err) {
                console.error("User fetch failed:", err);
                router.push("/sign-in");
            } finally {
                setAuthChecking(false);
            }
        }

        fetchUser();
    }, [router]);

    // ✅ Step 2: Fetch deliverables after user is set
    const fetchDeliverables = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/deliverables/cost-only`);
            const data = await response.json();
            setDeliverables(data);
        } catch (error) {
            console.error('Failed to fetch cost deliverables:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) fetchDeliverables();
    }, [user, fetchDeliverables]);

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
            header: "Status",
            accessorKey: "status",
            cell: (row: any) => (
                <Badge
                    className={
                        row.status === "completed"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : row.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : row.status === "rejected"
                                    ? "bg-red-100 text-red-800 hover:bg-red-100"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                >
                    {row.status
                        ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
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

    // ✅ Auth check loading UI
    if (authChecking) {
        return <div className="p-4">Checking authentication...</div>;
    }

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
                <div className="mt-4">Loading deliverables...</div>
            ) : (
                <DataTable
                    data={deliverables}
                    columns={deliverableColumns}
                    searchable
                    accordionMode
                    renderAccordionContent={(row) => (
                        <div className="p-4 space-y-4">
                            <h4 className="text-lg font-semibold">Submit Cost for: {row.title}</h4>
                            <AddCostForm deliverable={row} refetchAction={fetchDeliverables} />
                        </div>
                    )}
                />
            )}
        </PageTemplate>
    );
};

export default Page;
