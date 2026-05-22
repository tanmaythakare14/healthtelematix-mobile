import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Icon rendered inside the coloured circle */
  icon: React.ReactNode;
  /** Tailwind classes for the icon circle (bg + text color) */
  iconClassName?: string;
  title: string;
  /** Supports ReactNode so callers can bold names, add data-phi spans, etc. */
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Tailwind classes that override the confirm button styling */
  confirmClassName?: string;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  icon,
  iconClassName = 'bg-rose-50 text-rose-500',
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmClassName,
  onConfirm,
}: ConfirmDialogProps): React.JSX.Element {
  function handleConfirm() {
    onConfirm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden">
        {/* Body */}
        <DialogHeader className="px-6 pt-6 pb-5">
          <div className="flex flex-col items-center text-center gap-4">
            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', iconClassName)}>
              {icon}
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="text-[15px] font-bold text-foreground">{title}</DialogTitle>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Footer */}
        <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <Button
            type="button"
            variant="outline"
            className="h-9 px-6 text-[13px] flex-1"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className={cn(
              'h-9 px-6 text-[13px] flex-1',
              confirmClassName ?? 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs'
            )}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
