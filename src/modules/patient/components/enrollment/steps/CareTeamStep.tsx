import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { StaffSelect } from '../StaffSelect';
import type { StaffSelectOption } from '../StaffSelect';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z
  .object({
    careTeamPhysician: z.string().min(1, 'Select a physician'),
    careTeamNurse: z.string().catch(''),
    careTeamDHN: z.string().catch(''),
  })
  .strict();

type CareTeamFormValues = z.infer<typeof schema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface CareTeamStepProps {
  defaultValues?: Partial<CareTeamFormValues>;
  isEdit?: boolean;
  onBack: () => void;
  onSubmit: (data: CareTeamFormValues) => void;
  physicians: StaffSelectOption[];
  nurses: StaffSelectOption[];
  dhns: StaffSelectOption[];
  onCancel?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CareTeamStep({
  defaultValues,
  isEdit = false,
  onBack,
  onSubmit,
  physicians,
  nurses,
  dhns,
  onCancel,
}: CareTeamStepProps): React.JSX.Element {
  const form = useForm<CareTeamFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      careTeamPhysician: '',
      careTeamNurse: '',
      careTeamDHN: '',
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Section header */}
        <div>
          <p className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-[0.06em] mb-3">
            Care Team Assignment
          </p>
          <div className="space-y-4">
            {/* Physician */}
            <FormField
              control={form.control}
              name="careTeamPhysician"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-[12.5px] font-medium">
                    Physician <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <StaffSelect
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      options={physicians}
                      placeholder="Select a physician"
                      error={!!fieldState.error}
                    />
                  </FormControl>
                  {fieldState.error && <p className="text-[11px] text-destructive mt-1">{fieldState.error.message}</p>}
                </FormItem>
              )}
            />

            {/* Registered Nurse */}
            <FormField
              control={form.control}
              name="careTeamNurse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12.5px] font-medium">Registered Nurse</FormLabel>
                  <FormControl>
                    <StaffSelect
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      options={nurses}
                      placeholder="Select a Registered Nurse"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Digital Health Navigator */}
            <FormField
              control={form.control}
              name="careTeamDHN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12.5px] font-medium">Digital Health Navigator</FormLabel>
                  <FormControl>
                    <StaffSelect
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      options={dhns}
                      placeholder="Select a Digital Health Navigator"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 -mx-8 px-8 py-4 bg-white border-t border-slate-100 flex justify-between mt-6">
          {isEdit && onCancel ? (
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
            {isEdit ? 'Save Changes' : 'Pre-Enroll Patient'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
