'use client';

import React, { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import {Deliverable} from "@/app/utils/mockData";
import {ProofSubmissionForm} from "@/components/department/ProofSubmissionForm";

export default function ProofApprovalsPage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const columns = [
        {
            header: 'Task Title',
            accessorKey: 'deliverableTitle',
        },
        {
            header: 'Due Date',
            accessorKey: 'deliverableDueDate',
            cell: (row: any) =>
                typeof row.deliverableDueDate === 'string'
                    ? new Date(row.deliverableDueDate).toLocaleDateString()
                    : new Date(row.deliverableDueDate.seconds * 1000).toLocaleDateString(),
        },
        {
            header: 'Status',
            accessorKey: 'deliverableStatus',
            cell: (row: any) => (
                <Badge>{row.deliverableStatus}</Badge>
            ),
        },
        {
            header: 'Priority',
            accessorKey: 'deliverablePriority',
            cell: (row: any) => (
                <Badge variant="outline">{row.deliverablePriority}</Badge>
            ),
        },
        {
            header: 'Submitted By',
            accessorKey: 'userName',
        },
        {
            header: 'File',
            accessorKey: 'proofSubmission.proofFileUrl',
            cell: (row: any) =>
                row.proofSubmission.proofFileUrl ? (
                    <a
                        href={row.proofSubmission.proofFileUrl}
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

    return (
        <PageTemplate title="Proof Submissions" description="Review proof files submitted by departments.">
            {loading ? (
                <div>Loading...</div>
            ) : (
                <DataTable
                    data={rows}
                    columns={columns}
                    searchable
                    accordionMode
                    renderAccordionContent={(rows: Deliverable) => (
                        <div className="p-4 space-y-4">
                            <p>add form here</p>
                        </div>
                    )}
                />
            )}
        </PageTemplate>
    );
}
