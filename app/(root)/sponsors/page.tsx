"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageTemplate } from "@/components/layout/PageTemplate";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import AddSponsorForm from "@/components/sponsors/AddSponsorForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/DataTable";
import EditSponsorForm from "@/components/sponsors/EditSponsorForm";

export default function Sponsors() {
    const [showAddSponsor, setShowAddSponsor] = useState(false);
    const [editingSponsor, setEditingSponsor] = useState<string | null>(null);
    const [sponsors, setSponsors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const fetchSponsors = async () => {
        try {
            const res = await fetch("/api/sponsor"); // call our API route
            const data = await res.json();
            setSponsors(data.sponsors);
        } catch (error) {
            console.error("Failed to fetch sponsors:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSponsors();
    }, []);

    const columns = [
        {
            header: "Name",
            accessorKey: "name",
        },
        {
            header: "Value",
            accessorKey: "totalValue",
            cell: (row: any) => `$${(row.totalValue || 0).toLocaleString()}`,
        },
        {
            header: "Type",
            accessorKey: "sponsorType",
            cell: (row: any) => {
                if (row.inKindValue > 0 && row.cashValue > 0) {
                    return "Hybrid";
                } else if (row.cashValue > 0) {
                    return "Cash";
                } else {
                    return "In-Kind";
                }
            },
        },
        {
            header: "Completed",
            accessorKey: "completionRate",
            cell: (row: any) => `${row.completionRate || 0}%`,
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: any) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${
                        row.status === "active"
                            ? "bg-green-100 text-green-800"
                            : row.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                    }`}
                >
          {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : "Pending"}
        </span>
            ),
        },
        {
            header: "Actions",
            accessorKey: "id",
            cell: (row: any) => (
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => router.push(`/sponsors/${row.id}`)}
                    >
                        <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingSponsor(row.id)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading sponsors...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6 bg-background/95">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Sponsors Overview</h2>
                        <p className="text-muted-foreground">Manage sponsor relationships and deliverables</p>
                    </div>
                    <Dialog open={showAddSponsor} onOpenChange={setShowAddSponsor}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Sponsor
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="!w-full !max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Add New Sponsor</DialogTitle>
                                <DialogDescription>
                                    Enter the details for the new sponsor and upload MOU document.
                                </DialogDescription>
                            </DialogHeader>
                            <AddSponsorForm onSuccess={() => { setShowAddSponsor(false); fetchSponsors(); }} />
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Sponsors</CardTitle>
                        <CardDescription>View and manage all sponsor relationships</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={sponsors}
                            columns={columns}
                            searchable={true}
                            searchPlaceholder="Search sponsors..."
                        />
                    </CardContent>
                </Card>

                <Dialog open={editingSponsor !== null} onOpenChange={(open) => !open && setEditingSponsor(null)}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Edit Sponsor</DialogTitle>
                            <DialogDescription>Update the sponsor details below.</DialogDescription>
                        </DialogHeader>
                        {/*{editingSponsor && (*/}
                        {/*    <EditSponsorForm sponsorId={editingSponsor} onSuccess={() => { setEditingSponsor(null); fetchSponsors(); }} />*/}
                        {/*)}*/}
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
