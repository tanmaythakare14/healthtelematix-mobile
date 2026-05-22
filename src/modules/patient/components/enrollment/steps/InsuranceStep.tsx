import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Search, ChevronDown, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PortalSelect } from '../PortalSelect';
import type { EnrollmentStep2Values } from '../../../@types';

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_TYPE_OPTIONS = ['PPO', 'HMO', 'EPO', 'POS', 'HDHP', 'Medicare', 'Medicaid'];

const KNOWN_INSURERS = [
  'Aetna',
  'Anthem Blue Cross',
  'BlueCross BlueShield',
  'Cigna',
  'CareSource',
  'Centene',
  'EmblemHealth',
  'Humana',
  'Kaiser Permanente',
  'Medicaid',
  'Medicare',
  'Molina Healthcare',
  'Oscar Health',
  'Tricare',
  'UnitedHealthcare',
  'WellCare',
];

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z
  .object({
    insurancePlanName: z.string().min(1, 'Insurance plan name is required'),
    planType: z.string().min(1, 'Plan type is required'),
    memberId: z.string().min(1, 'Member ID is required'),
    groupNumber: z.string().min(1, 'Group number is required'),
    hasSecondaryInsurance: z.boolean().default(false),
    secondaryInsurance: z.string().optional().default(''),
    secondaryMemberId: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.hasSecondaryInsurance) {
      if (!data.secondaryInsurance || data.secondaryInsurance.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Secondary insurance name is required',
          path: ['secondaryInsurance'],
        });
      }
      if (!data.secondaryMemberId || data.secondaryMemberId.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Secondary member ID is required',
          path: ['secondaryMemberId'],
        });
      }
    }
  });

// ─── Searchable Insurance Dropdown ───────────────────────────────────────────

interface InsuranceSearchProps {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
}

function InsuranceSearch({ value, onChange, error }: InsuranceSearchProps): React.JSX.Element {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal query when value is set externally (e.g. demo fill)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = query.trim()
    ? KNOWN_INSURERS.filter((ins) => ins.toLowerCase().includes(query.toLowerCase()))
    : KNOWN_INSURERS;

  function select(ins: string) {
    setQuery(ins);
    onChange(ins);
    setOpen(false);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setOpen(true);
  }

  function handleClear() {
    setQuery('');
    onChange('');
    setOpen(false);
  }

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          'flex items-center h-10 rounded-md border bg-background text-sm ring-offset-background transition-colors',
          error ? 'border-destructive' : 'border-input',
          open && !error && 'border-primary ring-2 ring-primary/20'
        )}
      >
        <Search size={13} className="ml-3 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder="Search or type insurer name…"
          className="flex-1 px-2.5 h-full bg-transparent outline-none placeholder:text-muted-foreground text-sm"
        />
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="mr-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={13} />
          </button>
        ) : (
          <ChevronDown size={13} className="mr-3 text-muted-foreground" />
        )}
      </div>

      {open && (
        <div className="absolute z-[200] mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-[12px] text-muted-foreground">No match — value will be saved as typed</div>
          ) : (
            <ul className="max-h-[200px] overflow-y-auto py-1">
              {filtered.map((ins) => (
                <li key={ins}>
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      select(ins);
                    }}
                    className={cn(
                      'w-full px-4 py-2.5 text-left text-[13px] transition-colors flex items-center gap-2',
                      value === ins
                        ? 'bg-primary/[0.06] text-primary font-semibold'
                        : 'hover:bg-slate-50 text-foreground'
                    )}
                  >
                    {value === ins && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none" className="shrink-0">
                        <path
                          d="M1 4.5L4 7.5L10 1.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <span>{ins}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface InsuranceStepProps {
  defaultValues?: Partial<EnrollmentStep2Values>;
  onBack: () => void;
  onNext: (data: EnrollmentStep2Values) => void;
  mode?: 'enroll' | 'edit';
  onCancel?: () => void;
  hideFooter?: boolean;
  formId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InsuranceStep({
  defaultValues,
  onBack,
  onNext,
  mode = 'enroll',
  onCancel,
  hideFooter = false,
  formId,
}: InsuranceStepProps): React.JSX.Element {
  const form = useForm<EnrollmentStep2Values>({
    resolver: zodResolver(schema) as Resolver<EnrollmentStep2Values>,
    defaultValues: {
      insurancePlanName: '',
      planType: '',
      memberId: '',
      groupNumber: '',
      hasSecondaryInsurance: false,
      secondaryInsurance: '',
      secondaryMemberId: '',
      ...defaultValues,
    },
  });

  const hasSecondary = form.watch('hasSecondaryInsurance');

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onNext)} className="space-y-5">
        {/* ── Primary Insurance ───────────────────────────────────────────── */}
        <div>
          <p className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-[0.06em] mb-3">
            Primary Insurance
          </p>
          <div className="space-y-4">
            {/* Insurance Plan Name — Searchable */}
            <Controller
              control={form.control}
              name="insurancePlanName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">
                    Insurance Plan Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <InsuranceSearch value={field.value} onChange={field.onChange} error={!!fieldState.error} />
                  </FormControl>
                  {fieldState.error && <p className="text-[11px] text-destructive">{fieldState.error.message}</p>}
                </FormItem>
              )}
            />

            {/* Plan Type + Member ID */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="planType"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">
                      Plan Type <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <PortalSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={PLAN_TYPE_OPTIONS}
                        placeholder="Select plan type"
                        error={!!fieldState.error}
                      />
                    </FormControl>
                    {fieldState.error && <p className="text-[11px] text-destructive">{fieldState.error.message}</p>}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">
                      Member ID <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. BCB-2024-88432" className="h-10 text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Group Number */}
            <FormField
              control={form.control}
              name="groupNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">
                    Group Number <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. GRP-55901" className="h-10 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Secondary Insurance Toggle ───────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-foreground">Secondary Insurance</p>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">
                Does the patient have a secondary insurance plan?
              </p>
            </div>
            {/* Switch toggle */}
            <Controller
              control={form.control}
              name="hasSecondaryInsurance"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (!checked) {
                      form.setValue('secondaryInsurance', '');
                      form.setValue('secondaryMemberId', '');
                      form.clearErrors(['secondaryInsurance', 'secondaryMemberId']);
                    }
                  }}
                />
              )}
            />
          </div>

          {/* Expandable secondary fields */}
          {hasSecondary && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="secondaryInsurance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Secondary Plan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Medicare Part B" className="h-10 text-sm bg-white" {...field} />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondaryMemberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Secondary Member ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. MCR-1A2B3C4D5E" className="h-10 text-sm bg-white" {...field} />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

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
