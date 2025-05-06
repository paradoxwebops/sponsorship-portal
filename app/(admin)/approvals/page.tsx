'use client';

import React, { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { ApprovalForm } from '@/components/sponsors/ApprovalForm';
import { Button } from '@/components/ui/button';

export default function ProofApprovalsPage() {
    const [rows, setRows] = useState<any[]>([]);
    const [filteredRows, setFilteredRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

    const columns = [
        {
            header: 'Task Title',
            accessorKey: 'deliverableTitle',
        },
        {
            header: 'Company Name',
            accessorKey: 'sponsorName',
        },
        {
            header: 'Due Date',
            accessorKey: 'deliverableDueDate',
            cell: (row: any) =>
                typeof row.deliverableDueDate === 'string'
                    ? new Date(row.deliverableDueDate).toLocaleDateString()
                    : new Date(row.deliverableDueDate?.seconds * 1000).toLocaleDateString(),
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (row: any) => <Badge>{row.status}</Badge>,
        },
        {
            header: 'Priority',
            accessorKey: 'deliverablePriority',
            cell: (row: any) => <Badge variant="outline">{row.deliverablePriority}</Badge>,
        },
        {
            header: 'Submitted By',
            accessorKey: 'userName',
        },
        {
            header: 'File',
            accessorKey: 'proofFileUrl',
            cell: (row: any) =>
                row.proofFileUrl ? (
                    <a
                        href={row.proofFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                    >
                        View File
                    </a>
                ) : (
                    '—'
                ),
        },
    ];

    useEffect(() => {
        fetch('/api/deliverables/with-proofs')
            .then((res) => res.json())
            .then((data) => setRows(data))
            .catch((err) => console.error('Failed to fetch proof submissions:', err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredRows(rows);
        } else {
            setFilteredRows(rows.filter((row) => row.status === statusFilter));
        }
    }, [rows, statusFilter]);

    const handleStatusChange = (status: typeof statusFilter) => {
        setStatusFilter(status);
    };

    return (
        <PageTemplate title="Proof Submissions" description="Review proof files submitted by departments.">
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-semibold">Filter by status:</span>
                        {['pending', 'approved', 'rejected', 'all'].map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? 'default' : 'outline'}
                                onClick={() => handleStatusChange(status as any)}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                        ))}
                    </div>
                    <DataTable
                        data={filteredRows}
                        columns={columns}
                        searchable
                        accordionMode
                        renderAccordionContent={(row: any) => (
                            <ApprovalForm
                                proof={row}
                                onComplete={() => {
                                    fetch('/api/deliverables/with-proofs')
                                        .then((res) => res.json())
                                        .then((data) => setRows(data))
                                        .catch((err) => console.error('Failed to refresh proofs:', err));
                                }}
                            />
                        )}
                    />
                </>
            )}
        </PageTemplate>
    );
}
