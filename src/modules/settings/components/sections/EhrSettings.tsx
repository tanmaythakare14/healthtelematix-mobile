import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDown, Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { EhrDetailsFormValues } from '../../@types';

const EHR_PROVIDERS = ['Epic', 'Cerner', 'Athena', 'Meditech', 'Allscripts', 'NextGen'];

const INTEGRATION_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
] as const;

const ehrSchema = z.object({
  currentEhr: z.string().min(1, 'Please select an EHR provider'),
  smartAppUrl: z.string().url('Enter a valid URL').or(z.literal('')),
  integrationStatus: z.enum(['active', 'inactive', 'pending']),
});

function ViewField({ label, value }: { label: string; value: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">{label}</p>
      <p className="text-[13px] font-medium text-foreground leading-snug">{value}</p>
    </div>
  );
}

export function EhrSettings(): React.JSX.Element {
  const [ehrData, setEhrData] = useState<EhrDetailsFormValues>({
    currentEhr: 'Epic',
    smartAppUrl: 'https://smart.healthtelematix.com',
    integrationStatus: 'active',
  });
  const [ehrDialogOpen, setEhrDialogOpen] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [showIntegrationKey, setShowIntegrationKey] = useState(false);
  const [deleteEhrOpen, setDeleteEhrOpen] = useState(false);

  const ehrForm = useForm<EhrDetailsFormValues>({
    resolver: zodResolver(ehrSchema),
    defaultValues: ehrData,
  });
  const isEhrDirty = ehrForm.formState.isDirty;

  function handleEhrDialogOpen() {
    ehrForm.reset(ehrData);
    setEhrDialogOpen(true);
  }

  function onEhrSubmit(values: EhrDetailsFormValues): void {
    setEhrData(values);
    ehrForm.reset(values);
    setEhrDialogOpen(false);
    toast.success('EHR details updated successfully');
  }

  return (
    <div className="space-y-4">
      {/* ── EHR / EMR Details card — VIEW MODE ── */}
      <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-[13.5px] font-bold text-foreground">EHR / EMR Settings</h3>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">
              Electronic health record system and integration configuration.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {/* Sync connection toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-muted-foreground">Sync Connection</span>
              <button
                type="button"
                onClick={() => setSyncEnabled((v) => !v)}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200',
                  syncEnabled ? 'bg-primary' : 'bg-slate-200'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-xs ring-0 transition-transform duration-200',
                    syncEnabled ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>
              <span className={cn('text-[12px] font-semibold', syncEnabled ? 'text-primary' : 'text-muted-foreground')}>
                {syncEnabled ? 'On' : 'Off'}
              </span>
            </div>
            {/* Edit button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={handleEhrDialogOpen}
            >
              Edit EHR Settings
            </Button>
            {/* Delete button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/50"
              onClick={() => setDeleteEhrOpen(true)}
            >
              <Trash2 size={13} />
              Delete
            </Button>
          </div>
        </div>

        <div className="px-6 py-5 grid grid-cols-2 gap-x-10 gap-y-5">
          <ViewField label="Current EHR" value={ehrData.currentEhr} />
          <ViewField
            label="Integration Status"
            value={
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full border',
                  ehrData.integrationStatus === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : ehrData.integrationStatus === 'inactive'
                      ? 'bg-rose-50 text-rose-700 border-rose-100'
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    ehrData.integrationStatus === 'active'
                      ? 'bg-emerald-500'
                      : ehrData.integrationStatus === 'inactive'
                        ? 'bg-rose-500'
                        : 'bg-amber-400'
                  )}
                />
                {ehrData.integrationStatus.charAt(0).toUpperCase() + ehrData.integrationStatus.slice(1)}
              </span>
            }
          />
          <ViewField label="SMART App URL" value={ehrData.smartAppUrl || '—'} />
          <ViewField label="Connected On" value="Mar 14, 2025" />
          <ViewField
            label="Integration Key"
            value={
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-foreground tracking-[0.12em] font-mono">
                  {showIntegrationKey ? 'sk-ehr-4f9a2b1c8d3e7f6a' : '••••••••••••••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowIntegrationKey((v) => !v)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                >
                  {showIntegrationKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            }
          />
        </div>
      </div>

      {/* ── Delete EHR Confirmation ── */}
      <ConfirmDialog
        open={deleteEhrOpen}
        onOpenChange={setDeleteEhrOpen}
        icon={<Trash2 size={22} />}
        iconClassName="bg-rose-50 text-rose-500"
        title="Remove EHR Connection?"
        description={
          <>
            This will permanently disconnect <strong>{ehrData.currentEhr}</strong> and remove all integration settings.
            This action cannot be undone.
          </>
        }
        confirmLabel="Yes, Remove"
        cancelLabel="Keep Connection"
        onConfirm={() => toast.success('EHR connection removed.')}
      />

      {/* ── Edit EHR Dialog ── */}
      <Dialog open={ehrDialogOpen} onOpenChange={setEhrDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
            <DialogTitle className="text-[14px] font-bold">EHR / EMR Settings</DialogTitle>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Update your EHR system and integration configuration.
            </p>
          </DialogHeader>

          <Form {...ehrForm}>
            <form onSubmit={ehrForm.handleSubmit(onEhrSubmit)}>
              <div className="px-6 py-5 space-y-5">
                <FormField
                  control={ehrForm.control}
                  name="currentEhr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">Current EHR Provider</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <select
                            {...field}
                            className="w-full h-9 rounded-md border border-input bg-background pl-3 pr-8 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                          >
                            <option value="">Select EHR provider</option>
                            {EHR_PROVIDERS.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ehrForm.control}
                  name="smartAppUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">SMART App Integration URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://smart.yourclinic.com" className="h-9 text-sm" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ehrForm.control}
                  name="integrationStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">Integration Status</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <select
                            {...field}
                            className="w-full h-9 rounded-md border border-input bg-background pl-3 pr-8 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                          >
                            {INTEGRATION_STATUS_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="px-6 py-4 border-t border-slate-100">
                <div className="flex items-center justify-end gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 px-6 text-[13px]"
                    onClick={() => setEhrDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!isEhrDirty} className="h-9 px-6 text-[13px] shadow-xs">
                    Save EHR Settings
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
