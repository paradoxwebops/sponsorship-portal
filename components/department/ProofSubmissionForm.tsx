'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { FilePreviewDialog } from "@/components/shared/FilePreviewDialog";
import {MessageDepartment} from "@/index";

interface ProofSubmissionFormProps {
    deliverable: any;
    user: any;
    onSuccess: () => void;
}

export const ProofSubmissionForm = ({ deliverable, user, onSuccess }: ProofSubmissionFormProps) => {
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofMessage, setProofMessage] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        if (deliverable.proofMessage) {
            setProofMessage(deliverable.proofMessage);
        }
    }, [deliverable.proofMessage]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setProofFile(file);
    };

    const handleSubmit = async () => {
        setSubmitting(true);

        try {
            let proofFileUrl = deliverable.proofFileUrl || "";

            if (proofFile) {
                const formData = new FormData();
                formData.append("file", proofFile);
                formData.append("fileName", `${deliverable.id}_${user.id}_${proofFile.name}`);
                formData.append("purpose", "proof");

                const uploadRes = await fetch("/api/upload-url", {
                    method: "POST",
                    body: formData,
                });

                const result = await uploadRes.json();

                if (!uploadRes.ok || !result.fileUrl) {
                    throw new Error(result.error || "Upload failed");
                }

                proofFileUrl = result.fileUrl;
                console.log("✅ File uploaded to R2:", proofFileUrl);
            }

            const payload = {
                user,
                proofId: deliverable.proofId || null,
                proofFileUrl,
                proofMessage,
                status: "pending",
            };

            const response = await fetch(`/api/deliverables/${deliverable.id}/submit-proof`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Proof submitted successfully!");
                onSuccess();
            } else {
                toast.error("Failed to submit proof.");
            }
        } catch (error: any) {
            console.error("❌ General submission error:", error);
            toast.error(error.message || "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    const departmentMessage = (deliverable.listDepartments.find(
        (dep: MessageDepartment) => dep.userId === user.id
    ) as MessageDepartment | undefined)?.message;

    const reviewedAt = (() => {
        const val = deliverable.proofReviewedAt;
        if (!val) return null;
        if (typeof val === 'string' || typeof val === 'number') return new Date(val);
        if (val.seconds) return new Date(val.seconds * 1000);
        return null;
    })();

    const showUploadField = !deliverable.proofFileUrl || deliverable.proofStatus === "rejected";

    return (
        <div className="space-y-8">
            <Card>
                <CardContent className="p-6 space-y-4">
                    <h2 className="text-2xl font-bold mb-4">Deliverable Information</h2>
                    <div><span className="font-semibold">Title:</span> {deliverable.title}</div>
                    <div><span className="font-semibold">Description:</span> {deliverable.description}</div>
                    <div><span className="font-semibold">Due Date:</span> {typeof deliverable.dueDate === 'string'
                        ? format(new Date(deliverable.dueDate), 'PPP')
                        : format(new Date(deliverable.dueDate.seconds * 1000), 'PPP')}</div>
                    <div><span className="font-semibold">Status:</span> {deliverable.status}</div>
                    <div><span className="font-semibold">Priority:</span> {deliverable.priority}</div>
                    <div><span className="font-semibold">Proof Required:</span> {deliverable.proofRequired} </div>
                    <div><span className="font-semibold">Department Message:</span> {departmentMessage || "No message provided."}</div>

                    {deliverable.additionalFileUrl && (
                        <div>
                            <Button
                                variant="link"
                                type="button"
                                onClick={() => setPreviewOpen(true)}
                                className="text-blue-600 p-0 text-sm"
                            >
                                View Additional File
                            </Button>

                            <FilePreviewDialog
                                filePath={deliverable?.additionalFileUrl || ""}
                                open={previewOpen}
                                onClose={() => setPreviewOpen(false)}
                            />
                        </div>
                    )}

                    {deliverable.proofStatus === "rejected" && (
                        <div className="p-4 bg-red-100 border border-red-400 rounded text-red-700 space-y-1">
                            <strong>Rejected:</strong>
                            <p>{deliverable.proofReason || "No reason provided."}</p>
                            {reviewedAt && (
                                <p className="text-sm">
                                    Reviewed At: {format(reviewedAt, 'PPP p')}
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Submit Your Proof</h2>

                    {deliverable.proofFileUrl && (
                        <div>
                            <Label className="text-sm">Your Submitted File</Label>
                            <Button
                                variant="link"
                                onClick={() => setPreviewOpen(true)}
                                className="text-blue-600 p-0"
                            >
                                View File
                            </Button>
                            <FilePreviewDialog
                                filePath={deliverable.proofFileUrl}
                                open={previewOpen}
                                onClose={() => setPreviewOpen(false)}
                            />
                        </div>
                    )}

                    {showUploadField && (
                        <div className="space-y-2">
                            <Label>Upload New Proof File</Label>
                            <Input type="file" accept="image/*,application/pdf,video/*" onChange={handleFileChange} />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Proof Message</Label>
                        <Textarea
                            placeholder="Write a short message about the proof"
                            value={proofMessage}
                            onChange={(e) => setProofMessage(e.target.value)}
                            className="min-h-[120px]"
                        />
                    </div>

                    <Button disabled={submitting} onClick={handleSubmit}>
                        {submitting ? "Submitting..." : "Submit Proof"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
