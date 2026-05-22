import React, { useState } from 'react';
import { CheckCircle2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EnrollmentStep1Values, EnrollmentStep2Values, DiagnosisFormItem } from '../../@types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EHRPrefillData {
  ehrName: string;
  step1: Partial<EnrollmentStep1Values>;
  step2: Partial<EnrollmentStep2Values>;
  diagnoses?: DiagnosisFormItem[];
}

// ─── EHR Systems + Dummy Patient Data ────────────────────────────────────────

const EHR_SYSTEMS = [
  {
    id: 'epic',
    name: 'Epic',
    subtitle: 'MyChart · 1,284 records',
    color: '#e53e3e',
    initials: 'E',
    prefill: {
      ehrName: 'Epic',
      step1: {
        firstName: 'Michael',
        lastName: 'Thompson',
        mrn: 'EHR-28491',
        dateOfBirth: '1975-03-15',
        gender: 'Male',
        email: 'michael.thompson@gmail.com',
        phone: '(555) 847-2931',
        pcpName: '',
        zipCode: '60601',
        country: 'United States',
        state: 'IL',
        city: 'Chicago',
        addressLine1: '1247 Oak Street',
        addressLine2: '',
      },
      step2: {
        insurancePlanName: 'BlueCross BlueShield',
        planType: 'PPO',
        memberId: 'BCB-849271',
        groupNumber: 'GRP-0042',
        secondaryInsurance: '',
        secondaryMemberId: '',
      },
      diagnoses: [
        { conditionName: 'Hypertension', icdCode: 'I10', severity: 'Moderate' },
        { conditionName: 'Type 2 Diabetes', icdCode: 'E11.9', severity: 'Moderate' },
        { conditionName: 'Heart Failure', icdCode: 'I50.9', severity: 'Severe' },
      ],
    } satisfies EHRPrefillData,
  },
  {
    id: 'cerner',
    name: 'Cerner',
    subtitle: 'PowerChart · 876 records',
    color: '#2b6cb0',
    initials: 'C',
    prefill: {
      ehrName: 'Cerner',
      step1: {
        firstName: 'Jennifer',
        lastName: 'Rodriguez',
        mrn: 'CER-19472',
        dateOfBirth: '1968-07-22',
        gender: 'Female',
        email: 'jennifer.rodriguez@outlook.com',
        phone: '(555) 312-6745',
        pcpName: '',
        zipCode: '78701',
        country: 'United States',
        state: 'TX',
        city: 'Austin',
        addressLine1: '540 Maple Avenue',
        addressLine2: '',
      },
      step2: {
        insurancePlanName: 'Aetna Health',
        planType: 'HMO',
        memberId: 'AET-562831',
        groupNumber: 'GRP-7714',
        secondaryInsurance: 'Medicare Part B',
        secondaryMemberId: 'MED-44029X',
      },
      diagnoses: [
        { conditionName: 'Hypertension', icdCode: 'I10', severity: 'Moderate' },
        { conditionName: 'Atrial Fibrillation', icdCode: 'I48.91', severity: 'Moderate' },
      ],
    } satisfies EHRPrefillData,
  },
  {
    id: 'athena',
    name: 'Athenahealth',
    subtitle: 'athenaClinicals · 543 records',
    color: '#0d9488',
    initials: 'A',
    prefill: {
      ehrName: 'Athenahealth',
      step1: {
        firstName: 'Robert',
        lastName: 'Kim',
        mrn: 'ATH-56382',
        dateOfBirth: '1982-11-09',
        gender: 'Male',
        email: 'robert.kim@yahoo.com',
        phone: '(555) 204-9371',
        pcpName: '',
        zipCode: '98101',
        country: 'United States',
        state: 'WA',
        city: 'Seattle',
        addressLine1: '88 Elm Court',
        addressLine2: '',
      },
      step2: {
        insurancePlanName: 'UnitedHealthcare',
        planType: 'EPO',
        memberId: 'UHC-301928',
        groupNumber: 'GRP-5521',
        secondaryInsurance: '',
        secondaryMemberId: '',
      },
      diagnoses: [
        { conditionName: 'Obesity', icdCode: 'E66.9', severity: 'Mild' },
        { conditionName: 'Depression', icdCode: 'F32.9', severity: 'Mild' },
      ],
    } satisfies EHRPrefillData,
  },
  {
    id: 'ecw',
    name: 'eClinicalWorks',
    subtitle: 'eCW Cloud · 391 records',
    color: '#7c3aed',
    initials: 'eCW',
    prefill: {
      ehrName: 'eClinicalWorks',
      step1: {
        firstName: 'Amanda',
        lastName: 'Patel',
        mrn: 'ECW-73291',
        dateOfBirth: '1990-04-30',
        gender: 'Female',
        email: 'amanda.patel@icloud.com',
        phone: '(555) 768-4421',
        pcpName: '',
        zipCode: '33101',
        country: 'United States',
        state: 'FL',
        city: 'Miami',
        addressLine1: '2310 Birch Road',
        addressLine2: '',
      },
      step2: {
        insurancePlanName: 'Humana',
        planType: 'HDHP',
        memberId: 'HUM-847123',
        groupNumber: 'GRP-3309',
        secondaryInsurance: '',
        secondaryMemberId: '',
      },
      diagnoses: [{ conditionName: 'Anxiety', icdCode: 'F41.9', severity: 'Mild' }],
    } satisfies EHRPrefillData,
  },
  {
    id: 'nextgen',
    name: 'NextGen',
    subtitle: 'NextGen EHR · 228 records',
    color: '#d97706',
    initials: 'NG',
    prefill: {
      ehrName: 'NextGen',
      step1: {
        firstName: 'David',
        lastName: 'Williams',
        mrn: 'NXG-44821',
        dateOfBirth: '1963-09-14',
        gender: 'Male',
        email: 'david.williams@gmail.com',
        phone: '(555) 539-1204',
        pcpName: '',
        zipCode: '80201',
        country: 'United States',
        state: 'CO',
        city: 'Denver',
        addressLine1: '675 Pine Lane',
        addressLine2: '',
      },
      step2: {
        insurancePlanName: 'Cigna Health',
        planType: 'POS',
        memberId: 'CIG-920314',
        groupNumber: 'GRP-1187',
        secondaryInsurance: 'Medicare Part A',
        secondaryMemberId: 'MED-77031A',
      },
      diagnoses: [
        { conditionName: 'Hypertension', icdCode: 'I10', severity: 'Severe' },
        { conditionName: 'Type 2 Diabetes', icdCode: 'E11.9', severity: 'Moderate' },
        { conditionName: 'Atrial Fibrillation', icdCode: 'I48.91', severity: 'Moderate' },
      ],
    } satisfies EHRPrefillData,
  },
  {
    id: 'allscripts',
    name: 'Allscripts',
    subtitle: 'Sunrise · 164 records',
    color: '#059669',
    initials: 'AS',
    prefill: {
      ehrName: 'Allscripts',
      step1: {
        firstName: 'Patricia',
        lastName: 'Chen',
        mrn: 'ALS-61093',
        dateOfBirth: '1955-01-27',
        gender: 'Female',
        email: 'patricia.chen@hotmail.com',
        phone: '(555) 421-8807',
        pcpName: '',
        zipCode: '10001',
        country: 'United States',
        state: 'NY',
        city: 'New York',
        addressLine1: '1901 Cedar Blvd',
        addressLine2: '',
      },
      step2: {
        insurancePlanName: 'Medicare',
        planType: 'Medicare',
        memberId: 'MED-550193X',
        groupNumber: 'GRP-0001',
        secondaryInsurance: 'AARP Supplement',
        secondaryMemberId: 'AARP-88042',
      },
      diagnoses: [
        { conditionName: 'Hypertension', icdCode: 'I10', severity: 'Moderate' },
        { conditionName: 'Heart Failure', icdCode: 'I50.9', severity: 'Moderate' },
        { conditionName: 'Type 2 Diabetes', icdCode: 'E11.9', severity: 'Mild' },
      ],
    } satisfies EHRPrefillData,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface EHRSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (prefill: EHRPrefillData) => void;
  selectedEHR: string | null;
}

export function EHRSelector({ open, onClose, onSelect, selectedEHR }: EHRSelectorProps): React.JSX.Element | null {
  const [query, setQuery] = useState('');

  if (!open) return null;

  const filtered = EHR_SYSTEMS.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      {/* Shared backdrop — covers everything behind both panels */}
      <div className="fixed inset-0 bg-black/50 z-[49]" onClick={onClose} />

      {/* EHR panel — positioned left of center dialog (dialog is max-w-[640px] = 320px each side from center) */}
      <div
        className="fixed z-[60] flex flex-col bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden"
        style={{
          width: 280,
          maxHeight: '85vh',
          top: '50%',
          right: 'calc(50% + 336px)',
          transform: 'translateY(-50%)',
        }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <p className="text-[14px] font-bold text-foreground">EHR Systems</p>
          <p className="text-[11.5px] text-muted-foreground mt-0.5">Select a source to auto-fill</p>

          {/* Search */}
          <div className="relative mt-3">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search EHR..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-[12px] rounded-lg border border-slate-200 bg-slate-50 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* EHR list */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {filtered.map((ehr) => {
            const isSelected = selectedEHR === ehr.id;
            return (
              <button
                key={ehr.id}
                type="button"
                onClick={() => onSelect(ehr.prefill)}
                className={cn(
                  'w-full text-left rounded-xl px-3 py-2.5 flex items-center gap-3 transition-all duration-100',
                  isSelected ? 'bg-primary/8 ring-1 ring-primary/20' : 'hover:bg-slate-50'
                )}
              >
                {/* Logo */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-[10px] font-bold"
                  style={{ backgroundColor: ehr.color }}
                >
                  {ehr.initials}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-[12.5px] font-semibold leading-tight',
                      isSelected ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {ehr.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{ehr.subtitle}</p>
                </div>

                {/* Check */}
                {isSelected && <CheckCircle2 size={15} className="text-primary shrink-0" />}
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-[11.5px] text-muted-foreground text-center py-6">No EHR systems found</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 shrink-0">
          <p className="text-[10.5px] text-muted-foreground leading-relaxed">
            Data imported read-only. Review before enrolling.
          </p>
        </div>
      </div>
    </>
  );
}
