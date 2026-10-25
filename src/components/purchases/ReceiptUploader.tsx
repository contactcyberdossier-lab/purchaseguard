'use client';

// ========================================================
// Drag-and-Drop Receipt Uploader Component
// ========================================================

import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ALLOWED_RECEIPT_TYPES, MAX_FILE_SIZE_BYTES } from '@/lib/storage';
import { Button } from '../ui/Button';

interface ReceiptUploaderProps {
  purchaseId?: string;
  onUploadSuccess?: (fileInfo: { name: string; url?: string }) => void;
}

export function ReceiptUploader({ purchaseId, onUploadSuccess }: ReceiptUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setError(null);
    setSuccess(false);

    if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
      setError('Only PDF, JPG, PNG, and WEBP receipt files are supported.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('File size must be 10 MB or less.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !purchaseId) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch(`/api/purchases/${purchaseId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      setSelectedFile(null);
      if (onUploadSuccess) {
        onUploadSuccess({ name: data.attachment.file_name, url: data.attachment.signed_download_url });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload receipt');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 bg-background/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div className="text-sm font-semibold text-foreground">
            {selectedFile ? selectedFile.name : 'Click or drag receipt here to upload'}
          </div>
          <p className="text-xs text-muted-foreground">
            PDF, JPG, PNG, WEBP (Max 10 MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Receipt uploaded securely to cloud vault!</span>
        </div>
      )}

      {selectedFile && purchaseId && (
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 text-xs truncate max-w-[200px] sm:max-w-xs">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">{selectedFile.name}</span>
          </div>
          <Button size="sm" onClick={handleUpload} isLoading={isUploading}>
            Save Receipt
          </Button>
        </div>
      )}
    </div>
  );
}
