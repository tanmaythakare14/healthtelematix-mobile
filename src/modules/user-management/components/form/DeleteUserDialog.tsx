import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { UserListItem } from '../../@types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem | null;
  availableUsers: UserListItem[];
  onConfirm: (userId: string, transferToId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
  availableUsers,
  onConfirm,
}: DeleteUserDialogProps): React.JSX.Element {
  const [transferToId, setTransferToId] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!user) return <></>;

  // Mock patient count per physician
  const patientCount = user.id === 'u-002' ? 8 : user.id === 'u-004' ? 5 : 0;
  const hasPatients = patientCount > 0;

  const transferOptions = availableUsers.filter(
    (u) => u.id !== user.id && u.type === 'PHYSICIAN' && u.status === 'Active'
  );

  const selectedUser = transferOptions.find((u) => u.id === transferToId);
  const canDelete = !hasPatients || transferToId !== '';

  function handleConfirm() {
    if (!canDelete || !user) return;
    onConfirm(user.id, transferToId);
    setTransferToId('');
    onOpenChange(false);
  }

  function handleCancel() {
    setTransferToId('');
    setDropdownOpen(false);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleCancel();
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-rose-500" />
            </div>
            <DialogTitle className="text-[15px] font-bold text-foreground">Remove Physician</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-1">
          {/* Info text */}
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            You're about to remove <span className="font-semibold text-foreground">{user.fullName}</span> from the
            clinic. Before deleting, transfer their patients to another physician.
          </p>

          {/* Patient count card */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
              <Users size={15} className="text-rose-500" />
            </div>
            <div>
              <p className="text-[12px] text-rose-600 font-medium">Patients under this physician</p>
              <p className="text-[20px] font-bold text-rose-600 leading-tight">{patientCount}</p>
            </div>
          </div>

          {/* Transfer to dropdown — only shown when physician has patients */}
          {hasPatients && (
            <div>
              <label className="text-[12px] font-semibold text-foreground block mb-1.5">Transfer patients to</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="w-full h-9 flex items-center justify-between px-3 rounded-md border border-input bg-background text-sm text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                >
                  <span className={selectedUser ? 'text-foreground' : 'text-muted-foreground'}>
                    {selectedUser ? selectedUser.fullName : 'Select a physician'}
                  </span>
                  <ChevronDown size={14} className="text-muted-foreground shrink-0" />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
                    <div className="max-h-[200px] overflow-y-auto">
                      {transferOptions.length === 0 ? (
                        <div className="px-3 py-3 text-[12px] text-muted-foreground text-center">
                          No other active physicians available
                        </div>
                      ) : (
                        transferOptions.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setTransferToId(u.id);
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="text-[13px] font-medium text-foreground truncate">{u.fullName}</span>
                              <span className="text-[11px] text-muted-foreground">{u.specialty}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {!canDelete && (
                <p className="text-[11px] text-muted-foreground mt-1">You must select a physician before removing.</p>
              )}
            </div>
          )}

          {/* CTAs */}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" size="default" className="px-7 h-9" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              size="default"
              disabled={!canDelete}
              className="px-7 h-9 bg-rose-500 hover:bg-rose-600 text-white shadow-xs border-0"
              onClick={handleConfirm}
            >
              Delete Physician
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
