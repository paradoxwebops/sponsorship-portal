'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface FilePreviewDialogProps {
    filePath: string; // full R2 file URL or just key
    open: boolean;
    onClose: () => void;
}

export const FilePreviewDialog = ({ filePath, open, onClose }: FilePreviewDialogProps) => {
    const [previewUrl, setPreviewUrl] = useState('');
    const [fileType, setFileType] = useState<'image' | 'video' | 'pdf' | 'unknown'>('unknown');

    // ✅ Use your preferred extractFileKey logic
    const extractFileKey = (url: string): string => {
        const decoded = decodeURIComponent(url);
        const match = decoded.match(/\/(proofs\/.+)$/);
        return match ? match[1] : decoded;
    };

    const detectFileType = (path: string) => {
        const ext = path.split('.').pop()?.toLowerCase() || '';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
        if (['mp4', 'mov', 'webm'].includes(ext)) return 'video';
        if (ext === 'pdf') return 'pdf';
        return 'unknown';
    };

    useEffect(() => {
        if (open) {
            const fetchSignedUrl = async () => {
                const key = extractFileKey(filePath);
                const type = detectFileType(key);
                setFileType(type);

                const res = await fetch(`/api/preview-url?filePath=${encodeURIComponent(key)}`);
                const data = await res.json();

                if (res.ok && data.url) {
                    setPreviewUrl(data.url);
                } else {
                    setPreviewUrl('');
                }
            };

            fetchSignedUrl();
        }
    }, [open, filePath]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>File Preview</DialogTitle>
                    <Button
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </DialogHeader>

                {!previewUrl ? (
                    <p className="text-sm text-muted-foreground">Loading preview...</p>
                ) : (
                    <div className="mt-4 max-h-[75vh] overflow-auto space-y-4">
                        {fileType === 'image' && (
                            <img src={previewUrl} alt="Preview" className="rounded-lg max-w-full max-h-[500px]" />
                        )}
                        {fileType === 'video' && (
                            <video src={previewUrl} controls className="rounded-lg max-w-full max-h-[500px]" />
                        )}
                        {fileType === 'pdf' && (
                            <iframe
                                src={previewUrl}
                                className="w-full h-[500px] border rounded-lg"
                                title="PDF Preview"
                            />
                        )}
                        {fileType === 'unknown' && (
                            <p className="text-sm text-red-500">Cannot preview this file type.</p>
                        )}

                        <div className="flex justify-end">
                            <Button asChild variant="outline">
                                <a href={previewUrl} download target="_blank" rel="noopener noreferrer">
                                    ⬇️ Download
                                </a>
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
