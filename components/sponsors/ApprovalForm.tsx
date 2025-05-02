'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FilePreviewDialog } from "@/components/shared/FilePreviewDialog"; // ✅ Import the preview dialog

interface ApprovalFormProps {
    proof: any;
    onComplete?: () => void;
}

export const ApprovalForm = ({ proof, onComplete }: ApprovalFormProps) => {
    const [showRejectReason, setShowRejectReason] = useState(false);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false); // ✅ State for modal


    const handleAction = async (status: 'approved' | 'rejected') => {
        if (status === 'rejected' && !reason.trim()) {
            toast.error("Please provide a reason for rejection.");
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`/api/proofs/${proof.proofId}/update-status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    reason: status === 'rejected' ? reason : '',
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Proof ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
                if (onComplete) onComplete();
            } else {
                toast.error(result.message || "Failed to update status");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error updating proof status");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="shadow-md rounded-2xl p-4">
            <CardContent className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Submitted By</h3>
                    <p>{proof.userName} ({proof.userEmail})</p>
                </div>

                <Separator />

                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Deliverable Info</h3>
                    <p><strong>Title:</strong> {proof.deliverableTitle}</p>
                    <p><strong>Priority:</strong> <Badge variant="outline">{proof.deliverablePriority}</Badge></p>
                    <p><strong>Due:</strong> {new Date(proof.deliverableDueDate?.seconds ? proof.deliverableDueDate.seconds * 1000 : proof.deliverableDueDate).toLocaleDateString()}</p>
                </div>

                <Separator />

                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Proof Details</h3>
                    <p>
                        <strong>Submitted On:</strong> {
                        new Date(proof.timestamp?._seconds * 1000).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        timeZone: 'Asia/Kolkata'
                    })
                    }

                    </p>
                    <p><strong>Message:</strong> {proof.proofMessage || '—'}</p>
                    {proof.proofFileUrl && (
                        <div>
                            <strong>File:</strong>{" "}
                            <Button
                                variant="link"
                                onClick={() => setPreviewOpen(true)}
                                className="text-blue-600 p-0"
                            >
                                View File
                            </Button>
                            {/* ✅ Preview Dialog */}
                            <FilePreviewDialog
                                filePath={proof.proofFileUrl}
                                open={previewOpen}
                                onClose={() => setPreviewOpen(false)}
                            />
                        </div>
                    )}
                </div>

                {showRejectReason && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-red-600">Rejection Reason</h4>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Provide a reason for rejecting the proof"
                            className="min-h-[100px]"
                        />
                    </div>
                )}

                <div className="flex justify-between mt-6">
                    <Button
                        disabled={submitting}
                        className="bg-green-500 text-white hover:bg-green-600"
                        onClick={() => handleAction('approved')}
                    >
                        ✅ Accept
                    </Button>
                    {!showRejectReason ? (
                        <Button
                            disabled={submitting}
                            className="bg-red-500 text-white hover:bg-red-600"
                            onClick={() => setShowRejectReason(true)}
                        >
                            ❌ Reject
                        </Button>
                    ) : (
                        <Button
                            disabled={submitting}
                            className="bg-red-500 text-white hover:bg-red-600"
                            onClick={() => handleAction('rejected')}
                        >
                            Confirm Rejection
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
