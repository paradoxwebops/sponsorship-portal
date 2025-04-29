'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import {Deliverable} from "@/app/utils/mockData";

interface ProofSubmissionFormProps {
    deliverable: Deliverable;
    user: any;
    onSuccess: () => void;
}

export const ProofSubmissionForm = ({ deliverable, user, onSuccess }: ProofSubmissionFormProps) => {
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofMessage, setProofMessage] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setProofFile(file);
    };

    const handleSubmit = async () => {
        // if (!proofFile) {
        //     toast.error("Please upload a proof file.");
        //     return;
        // }

        setSubmitting(true);

        try {
            // Upload proof file
            const formData = new FormData();
            formData.append("file", proofFile || "random file");

            const uploadResponse = await fetch(`/api/upload-proof`, {
                method: "POST",
                body: formData,
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResult.url) {
                throw new Error("Failed to upload proof file");
            }

            const newProofSubmission: ProofSubmission = {
                userId: user.id, // use passed user
                userName: user.name,
                userEmail: user.email,
                proofFileUrl: uploadResult.url,
                proofMessage: proofMessage,
                timestamp: new Date(),
            };

            const response = await fetch(`/api/deliverables/${deliverable.id}/submit-proof`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proofSubmission: newProofSubmission }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Proof submitted successfully!");
                onSuccess();
            } else {
                toast.error("Failed to submit proof.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Deliverable Info */}
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
                    <div><span className="font-semibold">Proof Required:</span> {deliverable.proofRequired}</div>
                    <div>
                        <span className="font-semibold">Department Message:</span>{" "}
                        {
                            deliverable.listDepartments.find(dep => dep.userId === user.id)?.message || "No message provided."
                        }
                    </div>

                    {deliverable.additionalFileUrl && (
                        <div>
                            <Label>Additional File:</Label>
                            <a
                                href={deliverable.additionalFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline block mt-1"
                            >
                                Download Additional Instructions
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upload Form */}
            <Card>
                <CardContent className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Submit Your Proof</h2>

                    <div className="space-y-2">
                        <Label>Upload Proof File</Label>
                        <Input type="file" accept="image/*,application/pdf,video/*" onChange={handleFileChange} />
                    </div>

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
