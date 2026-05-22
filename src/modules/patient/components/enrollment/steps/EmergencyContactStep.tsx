import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, UserRound } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PortalSelect } from '../PortalSelect';
import type { EmergencyContactStepValues } from '../../../@types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Enter a valid 10-digit US phone number'),
  relationship: z.string().min(1, 'Relationship is required'),
});

const schema = z.object({
  contacts: z.array(contactSchema).min(1, 'At least one emergency contact is required'),
});

const RELATIONSHIP_OPTIONS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Guardian', 'Other'];

// ─── Props ────────────────────────────────────────────────────────────────────

interface EmergencyContactStepProps {
  defaultValues?: Partial<EmergencyContactStepValues>;
  onBack: () => void;
  onNext: (data: EmergencyContactStepValues) => void;
  mode?: 'enroll' | 'edit';
  onCancel?: () => void;
  hideFooter?: boolean;
  formId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EmergencyContactStep({
  defaultValues,
  onBack,
  onNext,
  mode = 'enroll',
  onCancel,
  hideFooter = false,
  formId,
}: EmergencyContactStepProps): React.JSX.Element {
  const form = useForm<EmergencyContactStepValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contacts:
        defaultValues?.contacts && defaultValues.contacts.length > 0
          ? defaultValues.contacts
          : [{ name: '', phone: '', relationship: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contacts',
  });

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onNext)} className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="rounded-[12px] border border-slate-200 bg-slate-50/50 p-4 space-y-4">
            {/* Contact header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <UserRound size={12} className="text-slate-500" />
                </div>
                <p className="text-[12px] font-bold text-foreground">
                  {index === 0 ? 'Primary Emergency Contact' : `Emergency Contact ${index + 1}`}
                </p>
              </div>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className={cn(
                    'w-7 h-7 rounded-md flex items-center justify-center transition-colors',
                    'text-muted-foreground hover:text-destructive hover:bg-destructive/8'
                  )}
                  title="Remove contact"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {/* Contact Name */}
            <FormField
              control={form.control}
              name={`contacts.${index}.name`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">
                    Contact Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Patricia Johnson" className="h-9 text-sm bg-white" {...f} />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Phone + Relationship */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`contacts.${index}.phone`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">
                      Phone Number <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex h-10 rounded-lg border border-input bg-white overflow-hidden transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                        <div className="flex items-center gap-1.5 px-3 bg-muted border-r border-border text-sm text-foreground font-medium select-none shrink-0">
                          🇺🇸 <span className="text-muted-foreground">+1</span>
                        </div>
                        <input
                          type="tel"
                          placeholder="(555) 000-0000"
                          autoComplete="tel"
                          data-phi="true"
                          className="flex-1 px-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                          value={f.value}
                          onChange={(e) => f.onChange(formatPhoneNumber(e.target.value))}
                          onBlur={f.onBlur}
                          name={f.name}
                          ref={f.ref}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
              <Controller
                control={form.control}
                name={`contacts.${index}.relationship`}
                render={({ field: f, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">
                      Relationship <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <PortalSelect
                        value={f.value}
                        onChange={f.onChange}
                        options={RELATIONSHIP_OPTIONS}
                        placeholder="Select relationship"
                        error={!!fieldState.error}
                      />
                    </FormControl>
                    {fieldState.error && <p className="text-[11px] text-destructive">{fieldState.error.message}</p>}
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}

        {/* Add another contact */}
        <button
          type="button"
          onClick={() => append({ name: '', phone: '', relationship: '' })}
          className="flex items-center gap-2 text-[12.5px] font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
            <Plus size={11} />
          </div>
          Add Another Emergency Contact
        </button>

        {/* Actions */}
        {!hideFooter && (
          <div className="sticky bottom-0 -mx-8 px-8 py-4 bg-white border-t border-slate-100 flex justify-between mt-6">
            {mode === 'edit' ? (
              <Button type="button" variant="outline" className="px-7 h-10" onClick={onCancel}>
                Cancel
              </Button>
            ) : (
              <Button type="button" variant="outline" className="px-7 h-10 gap-2" onClick={onBack}>
                <ArrowLeft size={14} />
                Back
              </Button>
            )}
            <Button type="submit" className="px-7 h-10 shadow-xs">
              {mode === 'edit' ? 'Save Changes' : 'Next'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
