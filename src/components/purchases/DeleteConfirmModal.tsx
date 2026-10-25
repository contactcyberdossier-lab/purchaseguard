'use client';

// ========================================================
// Delete Purchase Confirmation Dialog
// ========================================================

import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemName: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: DeleteConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Delete Purchase</h3>
            <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-foreground">
          Are you sure you want to delete <strong className="font-semibold">{itemName}</strong>? All associated reminders and uploaded receipts will also be permanently removed.
        </p>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            isLoading={isLoading}
            className="flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Permanently</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
