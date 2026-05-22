import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Plus, Trash2, Pencil, Search, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PortalSelect } from '../PortalSelect';
import type { DiagnosisFormItem, DiagnosisSeverity, MedicalConditionStepValues } from '../../../@types';

// ─── ICD Condition Catalog ────────────────────────────────────────────────────

interface IcdEntry {
  conditionName: string;
  icdCode: string;
}

const ICD_CATALOG: IcdEntry[] = [
  { conditionName: 'Hypertension', icdCode: 'I10' },
  { conditionName: 'Diabetes', icdCode: 'E11.9' },
  { conditionName: 'Heart Failure', icdCode: 'I50.9' },
  { conditionName: 'Obesity', icdCode: 'E66.9' },
  { conditionName: 'Atrial Fibrillation', icdCode: 'I48.91' },
  { conditionName: 'Depression', icdCode: 'F32.9' },
  { conditionName: 'Anxiety', icdCode: 'F41.9' },
];

const BHI_CONDITIONS = new Set(['depression', 'anxiety']);

// ─── Props ────────────────────────────────────────────────────────────────────

interface MedicalConditionStepProps {
  defaultDiagnoses?: DiagnosisFormItem[];
  defaultProgramRPM?: boolean;
  defaultProgramACPM?: boolean;
  defaultProgramBHI?: boolean;
  isEdit?: boolean;
  onBack: () => void;
  onNext: (data: MedicalConditionStepValues) => void;
  onCancel?: () => void;
}

// ─── Severity ─────────────────────────────────────────────────────────────────

const SEVERITY_OPTIONS: DiagnosisSeverity[] = ['Mild', 'Moderate', 'Severe'];

const SEVERITY_CLASS: Record<DiagnosisSeverity, string> = {
  Mild: 'bg-teal-50 text-teal-700 border-teal-100',
  Moderate: 'bg-amber-50 text-amber-700 border-amber-100',
  Severe: 'bg-rose-50 text-rose-700 border-rose-100',
};

// ─── Condition Search ─────────────────────────────────────────────────────────

function ConditionSearch({
  value,
  onChange,
  onIcdChange,
  error,
}: {
  value: string;
  onChange: (name: string) => void;
  onIcdChange: (code: string) => void;
  error?: boolean;
}): React.JSX.Element {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = query.trim()
    ? ICD_CATALOG.filter((e) => e.conditionName.toLowerCase().includes(query.toLowerCase()))
    : ICD_CATALOG;

  function select(entry: IcdEntry) {
    setQuery(entry.conditionName);
    onChange(entry.conditionName);
    onIcdChange(entry.icdCode);
    setOpen(false);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    const match = ICD_CATALOG.find((c) => c.conditionName.toLowerCase() === val.toLowerCase());
    onIcdChange(match?.icdCode ?? '');
    setOpen(true);
  }

  function handleClear() {
    setQuery('');
    onChange('');
    onIcdChange('');
  }

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
          'flex items-center h-10 rounded-md border bg-background text-sm transition-colors',
          error ? 'border-destructive' : 'border-input',
          open && !error && 'border-primary ring-2 ring-primary/20'
        )}
      >
        <Search size={13} className="ml-3 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onClick={() => setOpen(true)}
          placeholder="Search condition name…"
          className="flex-1 px-2.5 h-full bg-transparent outline-none placeholder:text-muted-foreground text-sm"
        />
        {query ? (
          <button type="button" onClick={handleClear} className="mr-2 text-muted-foreground hover:text-foreground">
            <X size={13} />
          </button>
        ) : (
          <ChevronDown size={13} className="mr-3 text-muted-foreground" />
        )}
      </div>

      {open && (
        <div className="absolute z-[300] mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-[12px] text-muted-foreground">
              No match — you can still type a custom name
            </div>
          ) : (
            <ul className="max-h-[200px] overflow-y-auto py-1">
              {filtered.map((entry) => (
                <li key={entry.icdCode}>
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      select(entry);
                    }}
                    className={cn(
                      'w-full px-4 py-2.5 text-left transition-colors flex items-center justify-between gap-3',
                      value === entry.conditionName
                        ? 'bg-primary/[0.06] text-primary'
                        : 'hover:bg-slate-50 text-foreground'
                    )}
                  >
                    <span className="text-[13px] font-medium">{entry.conditionName}</span>
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0">{entry.icdCode}</span>
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

// ─── Add / Edit Diagnosis Dialog ──────────────────────────────────────────────

export interface DiagnosisDialogProps {
  open: boolean;
  initial?: DiagnosisFormItem;
  onSave: (d: DiagnosisFormItem) => void;
  onClose: () => void;
}

export function DiagnosisDialog({ open, initial, onSave, onClose }: DiagnosisDialogProps): React.JSX.Element | null {
  const [conditionName, setConditionName] = useState(initial?.conditionName ?? '');
  const [icdCode, setIcdCode] = useState(initial?.icdCode ?? '');
  const [severity, setSeverity] = useState<DiagnosisSeverity | ''>(initial?.severity ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setConditionName(initial?.conditionName ?? '');
      setIcdCode(initial?.icdCode ?? '');
      setSeverity(initial?.severity ?? '');
      setErrors({});
    }
  }, [open, initial]);

  if (!open) return null;

  function handleSave() {
    const e: Record<string, string> = {};
    if (!conditionName.trim()) e.conditionName = 'Condition name is required';
    if (!icdCode.trim()) e.icdCode = 'ICD code is required';
    if (!severity) e.severity = 'Severity level is required';
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave({ conditionName: conditionName.trim(), icdCode: icdCode.trim(), severity: severity as DiagnosisSeverity });
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[480px] mx-4 rounded-2xl bg-white shadow-xs overflow-hidden">
        <div className="px-7 pt-6 pb-4 border-b border-slate-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-5 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
          >
            <X size={15} />
          </button>
          <p className="text-[16px] font-bold text-foreground">
            {initial ? 'Edit Medical Condition' : 'Add Medical Condition'}
          </p>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
            {initial
              ? 'Update the condition details below.'
              : 'Search for a condition by name. The ICD-10 code will auto-populate.'}
          </p>
        </div>
        <div className="px-7 py-6 space-y-5">
          <div>
            <label className="text-[12px] font-semibold text-foreground block mb-1.5">
              Condition Name <span className="text-destructive">*</span>
            </label>
            <ConditionSearch
              value={conditionName}
              onChange={setConditionName}
              onIcdChange={setIcdCode}
              error={!!errors.conditionName}
            />
            {errors.conditionName && <p className="text-[11px] text-destructive mt-1">{errors.conditionName}</p>}
          </div>
          <div>
            <label className="text-[12px] font-semibold text-foreground block mb-1.5">
              ICD-10 Code <span className="text-destructive">*</span>
            </label>
            <Input
              value={icdCode}
              onChange={(e) => setIcdCode(e.target.value)}
              placeholder="e.g. E11.9"
              className={cn('h-10 text-sm font-mono', errors.icdCode && 'border-destructive')}
            />
            {errors.icdCode && <p className="text-[11px] text-destructive mt-1">{errors.icdCode}</p>}
          </div>
          <div>
            <label className="text-[12px] font-semibold text-foreground block mb-1.5">
              Severity Level <span className="text-destructive">*</span>
            </label>
            <PortalSelect
              value={severity}
              onChange={(v) => setSeverity(v as DiagnosisSeverity)}
              options={SEVERITY_OPTIONS}
              placeholder="Select severity"
              error={!!errors.severity}
            />
            {errors.severity && <p className="text-[11px] text-destructive mt-1">{errors.severity}</p>}
          </div>
        </div>
        <div className="px-7 pb-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" className="h-9 px-6 text-[13px]" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" className="h-9 px-6 text-[13px] shadow-xs" onClick={handleSave}>
            {initial ? 'Save Changes' : 'Add Condition'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Diagnosis Card ───────────────────────────────────────────────────────────

function DiagnosisCard({
  diagnosis,
  index,
  onEdit,
  onDelete,
}: {
  diagnosis: DiagnosisFormItem;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
        <span className="text-[11px] font-bold text-muted-foreground">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{diagnosis.conditionName}</p>
        <p className="text-[11.5px] font-mono text-muted-foreground mt-0.5">{diagnosis.icdCode}</p>
      </div>
      <span
        className={cn(
          'text-[10.5px] font-semibold px-2.5 py-1 rounded-full border shrink-0',
          SEVERITY_CLASS[diagnosis.severity]
        )}
      >
        {diagnosis.severity}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/[0.07] transition-colors"
        >
          <Pencil size={12} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Program types ────────────────────────────────────────────────────────────

type ProgramKey = 'RPM' | 'APCM' | 'BHI';

const PROGRAMS: { key: ProgramKey; label: string; description: string }[] = [
  { key: 'RPM', label: 'RPM', description: 'Remote Patient Monitoring' },
  { key: 'APCM', label: 'APCM', description: 'Advanced Primary Care Mgmt' },
  { key: 'BHI', label: 'BHI', description: 'Behavioral Health Integration' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function MedicalConditionStep({
  defaultDiagnoses = [],
  defaultProgramRPM = false,
  defaultProgramACPM = false,
  defaultProgramBHI = false,
  isEdit = false,
  onBack,
  onNext,
  onCancel,
}: MedicalConditionStepProps): React.JSX.Element {
  const [diagnoses, setDiagnoses] = useState<DiagnosisFormItem[]>(defaultDiagnoses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [diagnosisError, setDiagnosisError] = useState(false);
  const [programError, setProgramError] = useState(false);

  const [selectedPrograms, setSelectedPrograms] = useState<Set<ProgramKey>>(() => {
    const s = new Set<ProgramKey>();
    if (defaultProgramRPM) s.add('RPM');
    if (defaultProgramACPM) s.add('APCM');
    if (defaultProgramBHI) s.add('BHI');
    return s;
  });

  const apcmEnabled = diagnoses.length >= 2;

  useEffect(() => {
    const hasBhiCondition = diagnoses.some((d) => BHI_CONDITIONS.has(d.conditionName.toLowerCase()));
    if (hasBhiCondition) {
      setSelectedPrograms((prev) => new Set(prev).add('BHI'));
    }
  }, [diagnoses]);

  function handleSubmit() {
    const noDiagnoses = diagnoses.length === 0;
    const noProgram = selectedPrograms.size === 0;
    if (noDiagnoses) setDiagnosisError(true);
    if (noProgram) setProgramError(true);
    if (noDiagnoses || noProgram) return;

    onNext({
      diagnoses,
      programRPM: selectedPrograms.has('RPM'),
      programACPM: selectedPrograms.has('APCM'),
      programBHI: selectedPrograms.has('BHI'),
    });
  }

  function handleSave(d: DiagnosisFormItem) {
    if (editingIndex !== null) {
      setDiagnoses((prev) => prev.map((item, i) => (i === editingIndex ? d : item)));
    } else {
      setDiagnoses((prev) => [...prev, d]);
    }
    setDiagnosisError(false);
    setDialogOpen(false);
    setEditingIndex(null);
  }

  function handleDelete(idx: number) {
    setDiagnoses((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      setSelectedPrograms((ps) => {
        const copy = new Set(ps);
        if (next.length < 2) copy.delete('APCM');
        const hasBhi = next.some((d) => BHI_CONDITIONS.has(d.conditionName.toLowerCase()));
        if (!hasBhi) copy.delete('BHI');
        return copy;
      });
      return next;
    });
  }

  return (
    <>
      <DiagnosisDialog
        open={dialogOpen}
        initial={editingIndex !== null ? diagnoses[editingIndex] : undefined}
        onSave={handleSave}
        onClose={() => {
          setDialogOpen(false);
          setEditingIndex(null);
        }}
      />

      <div className="space-y-5">
        {/* ── Diagnoses / Medical Conditions ─────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-[0.06em]">
                Diagnoses / Medical Conditions <span className="text-destructive">*</span>
              </p>
              {diagnoses.length > 0 ? (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {diagnoses.length} condition{diagnoses.length !== 1 ? 's' : ''} added
                </p>
              ) : diagnosisError ? (
                <p className="text-[11px] text-destructive mt-0.5">At least one condition is required</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingIndex(null);
                setDialogOpen(true);
              }}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/[0.06]"
            >
              <Plus size={13} />
              Add Condition
            </button>
          </div>

          {diagnoses.length > 0 ? (
            <div className="space-y-2">
              {diagnoses.map((d, idx) => (
                <DiagnosisCard
                  key={idx}
                  diagnosis={d}
                  index={idx}
                  onEdit={() => {
                    setEditingIndex(idx);
                    setDialogOpen(true);
                  }}
                  onDelete={() => handleDelete(idx)}
                />
              ))}
            </div>
          ) : (
            <div
              className={cn(
                'flex flex-col items-center justify-center py-8 rounded-xl border border-dashed bg-slate-50/50',
                diagnosisError ? 'border-destructive' : 'border-slate-200'
              )}
            >
              <p className="text-[12.5px] text-muted-foreground font-medium">No conditions added yet</p>
              <button
                type="button"
                onClick={() => {
                  setEditingIndex(null);
                  setDialogOpen(true);
                }}
                className="mt-2 text-[12px] font-semibold text-primary hover:underline"
              >
                + Add first condition
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100" />

        {/* ── Programs Enrolled ───────────────────────────────────────────── */}
        <div>
          <p className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-[0.06em] mb-1">
            Programs Enrolled <span className="text-destructive">*</span>
          </p>
          {programError && <p className="text-[11px] text-destructive mb-2">Select at least one program</p>}
          {!programError && <div className="mb-3" />}
          <div className="flex gap-3">
            {PROGRAMS.map(({ key, label, description }) => {
              const isChecked = selectedPrograms.has(key);
              const isDisabled = key === 'APCM' && !apcmEnabled;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return;
                    setSelectedPrograms((prev) => {
                      const next = new Set(prev);
                      if (next.has(key)) next.delete(key);
                      else next.add(key);
                      return next;
                    });
                    setProgramError(false);
                  }}
                  className={cn(
                    'flex-1 flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all',
                    isDisabled
                      ? 'border-slate-100 bg-slate-50/80 cursor-not-allowed'
                      : isChecked
                        ? 'border-primary bg-primary/[0.05] cursor-pointer'
                        : programError
                          ? 'border-destructive/40 bg-white hover:border-destructive/60 cursor-pointer'
                          : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                      isDisabled
                        ? 'border-slate-200 bg-slate-100'
                        : isChecked
                          ? 'border-primary bg-primary'
                          : 'border-slate-300 bg-white'
                    )}
                  >
                    {isChecked && !isDisabled && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path
                          d="M1 3.5L3.2 5.5L8 1"
                          stroke="white"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p
                        className={cn(
                          'text-[13px] font-bold leading-snug',
                          isDisabled ? 'text-slate-400' : isChecked ? 'text-primary' : 'text-foreground'
                        )}
                      >
                        {label}
                      </p>
                      {isDisabled && (
                        <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200 leading-none">
                          2+ diagnoses required
                        </span>
                      )}
                    </div>
                    <p className={cn('text-[11px] mt-0.5', isDisabled ? 'text-slate-400' : 'text-muted-foreground')}>
                      {description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────────────────────── */}
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
          <Button type="button" className="px-7 h-10 shadow-xs" onClick={handleSubmit}>
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
