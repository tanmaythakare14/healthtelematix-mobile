import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Clock, Download, FileText, Filter, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { PatientDetailData } from '@/modules/patient/@types';

// ─── Types ────────────────────────────────────────────────────────────────────

type CodeStatus = 'Generated' | 'Pending';
type ProgramType = 'RPM' | 'APCM' | 'BHI';

type StepRole = 'RN' | 'DHN' | 'Physician' | 'System' | 'Patient';

interface SessionStep {
  time: string;
  label: string;
  role: StepRole;
  duration: string;
}

interface SessionTimeline {
  startTime: string;
  endTime: string;
  duration: string;
  steps: SessionStep[];
}

interface BillingRow {
  id: string;
  program: ProgramType;
  invoiceNumber: string;
  pcpName: string;
  pcpNpi: string;
  cptCode: string;
  cptDescription: string;
  billingMonth: string;
  generationDate: string;
  status: CodeStatus;
  claimReason: string;
  timeline: SessionTimeline;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value: string): string {
  if (!value || value === '—') return '—';
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return value;
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const dd = String(parsed.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${parsed.getFullYear()}`;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const BILLING_ROWS: BillingRow[] = [
  {
    id: 'r1',
    program: 'RPM',
    invoiceNumber: 'INV-2026-0041',
    pcpName: 'Dr. Michael Torres',
    pcpNpi: '1234567890',
    cptCode: '99457',
    cptDescription: 'First 20 min clinical staff time',
    billingMonth: 'Apr 2026',
    generationDate: 'Apr 30, 2026',
    status: 'Generated',
    claimReason:
      'Patient enrolled in RPM with active remote monitoring. Minimum 20 minutes of clinical staff time documented for blood pressure management.',
    timeline: {
      startTime: 'Apr 30, 2026 · 9:00 AM',
      endTime: 'Apr 30, 2026 · 9:22 AM',
      duration: '22 min',
      steps: [
        { time: '9:00 AM', label: 'Session Started', role: 'Patient', duration: '—' },
        { time: '9:08 AM', label: 'Vitals Reviewed', role: 'RN', duration: '8 min' },
        { time: '9:14 AM', label: 'Care Notes Updated', role: 'DHN', duration: '6 min' },
        { time: '9:22 AM', label: 'Session Completed', role: 'Physician', duration: '8 min' },
      ],
    },
  },
  {
    id: 'r2',
    program: 'RPM',
    invoiceNumber: 'INV-2026-0041',
    pcpName: 'Dr. Michael Torres',
    pcpNpi: '1234567890',
    cptCode: '99458',
    cptDescription: 'Additional 20 min clinical staff time',
    billingMonth: 'Apr 2026',
    generationDate: 'Apr 30, 2026',
    status: 'Generated',
    claimReason:
      'Additional 20-minute remote monitoring clinical review completed. Documented physician-directed care for ongoing hypertension management.',
    timeline: {
      startTime: 'Apr 30, 2026 · 9:22 AM',
      endTime: 'Apr 30, 2026 · 9:44 AM',
      duration: '22 min',
      steps: [
        { time: '9:22 AM', label: 'Continuation Started', role: 'Patient', duration: '—' },
        { time: '9:30 AM', label: 'Medication Reviewed', role: 'RN', duration: '8 min' },
        { time: '9:40 AM', label: 'Physician Consulted', role: 'Physician', duration: '10 min' },
        { time: '9:44 AM', label: 'Session Completed', role: 'Physician', duration: '4 min' },
      ],
    },
  },
  {
    id: 'r3',
    program: 'RPM',
    invoiceNumber: 'INV-2026-0041',
    pcpName: 'Dr. Michael Torres',
    pcpNpi: '1234567890',
    cptCode: '99454',
    cptDescription: 'Device supply with daily monitoring',
    billingMonth: 'Apr 2026',
    generationDate: '—',
    status: 'Pending',
    claimReason:
      'Remote physiologic monitoring device supply — BP cuff provided with daily transmission requirement pending billing cycle completion.',
    timeline: {
      startTime: 'Apr 1, 2026 · 8:00 AM',
      endTime: 'Apr 30, 2026 · 11:59 PM',
      duration: '30 days',
      steps: [
        { time: 'Apr 1', label: 'Device Provisioned', role: 'DHN', duration: '—' },
        { time: 'Apr 1–30', label: 'Daily Monitoring Active', role: 'System', duration: '30 days' },
        { time: 'Apr 30', label: 'Cycle Pending Billing', role: 'System', duration: '—' },
      ],
    },
  },
  {
    id: 'a1',
    program: 'APCM',
    invoiceNumber: 'INV-2026-0039',
    pcpName: 'Dr. Michael Torres',
    pcpNpi: '1234567890',
    cptCode: '99490',
    cptDescription: 'Chronic care management, 20 min',
    billingMonth: 'Apr 2026',
    generationDate: 'Apr 30, 2026',
    status: 'Generated',
    claimReason:
      'Chronic care management services for patient with multiple complex conditions. At least 20 minutes of clinical staff time logged with care plan review.',
    timeline: {
      startTime: 'Apr 30, 2026 · 10:00 AM',
      endTime: 'Apr 30, 2026 · 10:22 AM',
      duration: '22 min',
      steps: [
        { time: '10:00 AM', label: 'CCM Session Started', role: 'Patient', duration: '—' },
        { time: '10:09 AM', label: 'Care Plan Reviewed', role: 'RN', duration: '9 min' },
        { time: '10:18 AM', label: 'Referral Coordinated', role: 'DHN', duration: '9 min' },
        { time: '10:22 AM', label: 'Session Completed', role: 'Physician', duration: '4 min' },
      ],
    },
  },
  {
    id: 'a2',
    program: 'APCM',
    invoiceNumber: 'INV-2026-0039',
    pcpName: 'Dr. Michael Torres',
    pcpNpi: '1234567890',
    cptCode: '99491',
    cptDescription: 'Care mgmt, physician directed, 30 min',
    billingMonth: 'Apr 2026',
    generationDate: '—',
    status: 'Pending',
    claimReason:
      'Physician-directed care management with documented 30 minutes of direct physician time for complex chronic condition monitoring.',
    timeline: {
      startTime: 'Apr 30, 2026 · 11:00 AM',
      endTime: 'Apr 30, 2026 · 11:32 AM',
      duration: '32 min',
      steps: [
        { time: '11:00 AM', label: 'Physician Session Started', role: 'Patient', duration: '—' },
        { time: '11:12 AM', label: 'Vitals & Labs Reviewed', role: 'Physician', duration: '12 min' },
        { time: '11:25 AM', label: 'Treatment Plan Updated', role: 'Physician', duration: '13 min' },
        { time: '11:32 AM', label: 'Session Pending', role: 'System', duration: '7 min' },
      ],
    },
  },
  {
    id: 'r4',
    program: 'RPM',
    invoiceNumber: 'INV-2026-0028',
    pcpName: 'Dr. Michael Torres',
    pcpNpi: '1234567890',
    cptCode: '99457',
    cptDescription: 'First 20 min clinical staff time',
    billingMonth: 'Mar 2026',
    generationDate: 'Mar 31, 2026',
    status: 'Generated',
    claimReason:
      'Monthly RPM review completed. Clinical staff reviewed transmitted vitals data and documented 20-minute care coordination.',
    timeline: {
      startTime: 'Mar 31, 2026 · 9:05 AM',
      endTime: 'Mar 31, 2026 · 9:24 AM',
      duration: '19 min',
      steps: [
        { time: '9:05 AM', label: 'Session Started', role: 'Patient', duration: '—' },
        { time: '9:13 AM', label: 'Vitals Data Reviewed', role: 'RN', duration: '8 min' },
        { time: '9:24 AM', label: 'Session Completed', role: 'Physician', duration: '11 min' },
      ],
    },
  },
  {
    id: 'a3',
    program: 'APCM',
    invoiceNumber: 'INV-2026-0028',
    pcpName: 'Dr. Michael Torres',
    pcpNpi: '1234567890',
    cptCode: '99490',
    cptDescription: 'Chronic care management, 20 min',
    billingMonth: 'Mar 2026',
    generationDate: 'Mar 31, 2026',
    status: 'Generated',
    claimReason:
      'Monthly chronic care management session completed. Updated care plan and coordinated specialist referral for ongoing chronic condition.',
    timeline: {
      startTime: 'Mar 31, 2026 · 2:00 PM',
      endTime: 'Mar 31, 2026 · 2:21 PM',
      duration: '21 min',
      steps: [
        { time: '2:00 PM', label: 'CCM Session Started', role: 'Patient', duration: '—' },
        { time: '2:10 PM', label: 'Care Plan Updated', role: 'RN', duration: '10 min' },
        { time: '2:21 PM', label: 'Session Completed', role: 'Physician', duration: '11 min' },
      ],
    },
  },
  {
    id: 'r5',
    program: 'RPM',
    invoiceNumber: 'INV-2026-0015',
    pcpName: 'Dr. Michael Torres',
    pcpNpi: '1234567890',
    cptCode: '99091',
    cptDescription: 'Collection & interpretation of data',
    billingMonth: 'Feb 2026',
    generationDate: 'Feb 28, 2026',
    status: 'Generated',
    claimReason:
      'Physician reviewed and interpreted 30 days of remotely transmitted physiologic data. Adjustments made to medication and monitoring plan.',
    timeline: {
      startTime: 'Feb 1, 2026 · 8:00 AM',
      endTime: 'Feb 28, 2026 · 3:18 PM',
      duration: '30 days',
      steps: [
        { time: 'Feb 1', label: 'Monitoring Period Started', role: 'Patient', duration: '—' },
        { time: 'Feb 28 · 3:00 PM', label: 'Data Interpretation', role: 'Physician', duration: '18 min' },
        { time: 'Feb 28 · 3:18 PM', label: 'Interpretation Completed', role: 'Physician', duration: '—' },
      ],
    },
  },
  {
    id: 'a4',
    program: 'APCM',
    invoiceNumber: 'INV-2026-0015',
    pcpName: 'Dr. Michael Torres',
    pcpNpi: '1234567890',
    cptCode: '99487',
    cptDescription: 'Complex chronic care management, 60 min',
    billingMonth: 'Feb 2026',
    generationDate: 'Feb 28, 2026',
    status: 'Generated',
    claimReason:
      'Complex chronic care management — 60 minutes of clinical time documented. Multiple comorbidities requiring advanced coordination across care team.',
    timeline: {
      startTime: 'Feb 28, 2026 · 9:00 AM',
      endTime: 'Feb 28, 2026 · 10:03 AM',
      duration: '63 min',
      steps: [
        { time: '9:00 AM', label: 'Complex CCM Started', role: 'Patient', duration: '—' },
        { time: '9:18 AM', label: 'Specialist Coordination', role: 'Physician', duration: '18 min' },
        { time: '9:40 AM', label: 'Care Team Synced', role: 'RN', duration: '22 min' },
        { time: '10:03 AM', label: 'Session Completed', role: 'Physician', duration: '23 min' },
      ],
    },
  },
];

// ─── PDF Invoice Generator ────────────────────────────────────────────────────

function generateAndDownloadInvoice(row: BillingRow, patient: PatientDetailData | undefined): void {
  const fmtDate = (v: string): string => {
    if (!v || v === '—') return '—';
    const parsed = new Date(v);
    if (isNaN(parsed.getTime())) return v;
    return parsed.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const patientName = patient?.fullName ?? '—';
  const patientMrn = patient?.mrn ?? '—';
  const patientDob = patient?.dateOfBirth ? fmtDate(patient.dateOfBirth) : '—';
  const patientGender = patient?.gender ?? '—';
  const patientEmail = patient?.email ?? '—';
  const patientPhone = patient?.phone ?? '—';
  const patientAddress = patient?.address ?? '—';
  const patientInsurance = patient?.insurance?.planName ?? '—';
  const programsStr = patient?.programs?.join(', ') || '—';

  const statusColor = row.status === 'Generated' ? '#059669' : '#d97706';
  const statusBg = row.status === 'Generated' ? '#ecfdf5' : '#fffbeb';
  const statusBorder = row.status === 'Generated' ? '#a7f3d0' : '#fde68a';

  const progColorMap: Record<ProgramType, { bg: string; color: string; border: string }> = {
    RPM: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    APCM: { bg: '#f0fdfa', color: '#0d9488', border: '#99f6e4' },
    BHI: { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
  };
  const prog = progColorMap[row.program];

  const stepsRows = row.timeline.steps
    .map((step, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === row.timeline.steps.length - 1;
      const dot = isFirst ? '#1a2d45' : isLast ? '#059669' : '#cbd5e1';
      return `<tr>
        <td style="padding:8px 14px;width:14px;vertical-align:middle;">
          <div style="width:8px;height:8px;border-radius:50%;background:${dot};"></div>
        </td>
        <td style="padding:8px 8px;width:90px;font-size:11.5px;font-weight:700;color:#0f172a;vertical-align:middle;">${step.time}</td>
        <td style="padding:8px 8px;font-size:11.5px;color:#64748b;vertical-align:middle;">${step.label}</td>
      </tr>`;
    })
    .join('');

  const now = new Date();
  const generatedOn = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const generatedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const startTimeParts = row.timeline.startTime.split('·');
  const endTimeParts = row.timeline.endTime.split('·');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Invoice ${row.invoiceNumber} — Health Telematix</title>
<style>
@media print { body { margin:0; } @page { margin:0.7in; size:A4; } }
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;color:#0f172a;background:#fff;font-size:13px;line-height:1.5;}
.page{padding:48px;max-width:820px;margin:0 auto;}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2.5px solid #1a2d45;}
.logo-row{display:flex;align-items:center;gap:12px;}
.logo-box{width:42px;height:42px;border-radius:10px;background:#1a2d45;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.logo-name{font-size:18px;font-weight:800;color:#1a2d45;letter-spacing:-0.5px;}
.logo-sub{font-size:9.5px;color:#64748b;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-top:1px;}
.inv-title{font-size:30px;font-weight:900;color:#1a2d45;letter-spacing:-1px;text-align:right;}
.inv-number{font-size:13px;color:#64748b;text-align:right;margin-top:4px;font-weight:500;}
.inv-date{font-size:10px;color:#94a3b8;text-align:right;margin-top:2px;}
.badge{display:inline-flex;align-items:center;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.04em;}
.patient-card{background:linear-gradient(135deg,#1a2d45 0%,#0d9488 100%);color:#fff;border-radius:14px;padding:22px 26px;margin-bottom:28px;}
.patient-name{font-size:19px;font-weight:800;letter-spacing:-0.5px;margin-bottom:4px;}
.patient-sub{font-size:11px;opacity:0.7;font-weight:500;}
.patient-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px 28px;margin-top:18px;}
.pf-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;opacity:0.6;margin-bottom:2px;}
.pf-value{font-size:12px;font-weight:600;opacity:0.95;}
.section{margin-bottom:24px;}
.section-title{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #f1f5f9;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px 40px;}
.f-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;margin-bottom:3px;}
.f-value{font-size:13px;font-weight:600;color:#0f172a;}
.f-value.light{font-weight:500;color:#334155;}
.tl-bar{display:flex;align-items:center;gap:16px;margin-bottom:16px;padding:14px 18px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;}
.tl-end{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:80px;}
.tl-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
.tl-time{font-size:12px;font-weight:700;}
.tl-date{font-size:9px;color:#94a3b8;}
.tl-connector{flex:1;display:flex;flex-direction:column;align-items:center;}
.tl-line{width:100%;height:1px;background:#cbd5e1;}
.tl-dur{font-size:10px;font-weight:700;color:#64748b;background:#fff;border:1px solid #e2e8f0;padding:2px 10px;border-radius:20px;margin:5px 0;}
.steps-tbl{width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;}
.steps-tbl td{border-bottom:1px solid #f1f5f9;}
.steps-tbl tr:last-child td{border-bottom:none;}
.claim-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 18px;font-size:13px;color:#334155;line-height:1.75;}
hr.div{border:none;border-top:1px solid #f1f5f9;margin:22px 0;}
.footer{margin-top:36px;padding-top:18px;border-top:1.5px solid #f1f5f9;display:flex;justify-content:space-between;align-items:flex-end;}
.footer p{font-size:10px;color:#94a3b8;line-height:1.6;}
.footer strong{color:#64748b;}
</style>
</head>
<body>
<div class="page">

<!-- Header -->
<div class="header">
  <div class="logo-row">
    <div class="logo-box">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M9 12h6M12 9v6" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="12" cy="12" r="9" stroke="#fff" stroke-width="2"/>
      </svg>
    </div>
    <div>
      <div class="logo-name">Health Telematix</div>
      <div class="logo-sub">Clinical Portal</div>
    </div>
  </div>
  <div>
    <div class="inv-title">INVOICE</div>
    <div class="inv-number">${row.invoiceNumber}</div>
    <div class="inv-date">Generated ${generatedOn} &nbsp;·&nbsp; ${generatedTime}</div>
    <div style="text-align:right;margin-top:8px;">
      <span class="badge" style="background:${statusBg};color:${statusColor};border:1px solid ${statusBorder};">${row.status}</span>
    </div>
  </div>
</div>

<!-- Patient Card -->
<div class="patient-card">
  <div class="patient-name">${patientName}</div>
  <div class="patient-sub">MRN: ${patientMrn} &nbsp;·&nbsp; Programs: ${programsStr}</div>
  <div class="patient-grid">
    <div><div class="pf-label">Date of Birth</div><div class="pf-value">${patientDob}</div></div>
    <div><div class="pf-label">Gender</div><div class="pf-value">${patientGender}</div></div>
    <div><div class="pf-label">Insurance</div><div class="pf-value">${patientInsurance}</div></div>
    <div><div class="pf-label">Phone</div><div class="pf-value">${patientPhone}</div></div>
    <div><div class="pf-label">Email</div><div class="pf-value">${patientEmail}</div></div>
    <div><div class="pf-label">Address</div><div class="pf-value">${patientAddress}</div></div>
  </div>
</div>

<!-- Invoice & CPT Details -->
<div class="section">
  <div class="section-title">Invoice &amp; CPT Details</div>
  <div class="grid2">
    <div><div class="f-label">Invoice Number</div><div class="f-value">${row.invoiceNumber}</div></div>
    <div>
      <div class="f-label">Status</div>
      <span class="badge" style="background:${statusBg};color:${statusColor};border:1px solid ${statusBorder};">${row.status}</span>
    </div>
    <div><div class="f-label">CPT Code</div><div class="f-value">${row.cptCode}</div></div>
    <div>
      <div class="f-label">Program</div>
      <span class="badge" style="background:${prog.bg};color:${prog.color};border:1px solid ${prog.border};">${row.program}</span>
    </div>
    <div style="grid-column:1/-1;"><div class="f-label">CPT Description</div><div class="f-value light">${row.cptDescription}</div></div>
  </div>
</div>

<hr class="div"/>

<!-- Session Timeline -->
<div class="section">
  <div class="section-title">Session Timeline &nbsp;·&nbsp; ${row.timeline.duration}</div>
  <div class="tl-bar">
    <div class="tl-end">
      <div class="tl-dot" style="background:#1a2d45;box-shadow:0 0 0 3px rgba(26,45,69,0.15);"></div>
      <div class="tl-time" style="color:#1a2d45;">${startTimeParts[1]?.trim() ?? row.timeline.startTime}</div>
      <div class="tl-date">${startTimeParts[0]?.trim()}</div>
    </div>
    <div class="tl-connector">
      <div class="tl-line"></div>
      <div class="tl-dur">${row.timeline.duration}</div>
      <div class="tl-line"></div>
    </div>
    <div class="tl-end">
      <div class="tl-dot" style="background:#059669;box-shadow:0 0 0 3px rgba(5,150,105,0.15);"></div>
      <div class="tl-time" style="color:#059669;">${endTimeParts[1]?.trim() ?? row.timeline.endTime}</div>
      <div class="tl-date">${endTimeParts[0]?.trim()}</div>
    </div>
  </div>
  <table class="steps-tbl"><tbody>${stepsRows}</tbody></table>
</div>

<hr class="div"/>

<!-- Physician & Billing Period -->
<div class="section">
  <div class="section-title">Physician &amp; Billing Period</div>
  <div class="grid2">
    <div><div class="f-label">PCP Name</div><div class="f-value">${row.pcpName}</div></div>
    <div><div class="f-label">NPI Number</div><div class="f-value">${row.pcpNpi}</div></div>
    <div><div class="f-label">Billing Month</div><div class="f-value">${row.billingMonth}</div></div>
    <div><div class="f-label">Generation Date</div><div class="f-value">${row.generationDate}</div></div>
  </div>
</div>

<hr class="div"/>

<!-- Claim Reason -->
<div class="section">
  <div class="section-title">Claim Reason</div>
  <div class="claim-box">${row.claimReason}</div>
</div>

<!-- Footer -->
<div class="footer">
  <p><strong>Health Telematix</strong><br>Clinical Portal — Billing Invoice<br>This document is confidential and for authorized personnel only.</p>
  <p style="text-align:right;">Document generated: ${generatedOn}<br>Invoice: ${row.invoiceNumber}<br>Patient MRN: ${patientMrn}</p>
</div>

</div>
<script>window.onload=function(){setTimeout(function(){window.print();},400);};</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    toast.error('Pop-ups are blocked. Please allow pop-ups to download the invoice.');
    URL.revokeObjectURL(url);
    return;
  }
  win.addEventListener('load', () => setTimeout(() => URL.revokeObjectURL(url), 2000));
}

// ─── Config ───────────────────────────────────────────────────────────────────

const PROGRAM_STYLE: Record<ProgramType, string> = {
  RPM: 'bg-blue-50 text-blue-700 border-blue-100',
  APCM: 'bg-teal-50 text-teal-700 border-teal-200',
  BHI: 'bg-violet-50 text-violet-700 border-violet-200',
};

const TABLE_HEADERS = [
  'Program',
  'Invoice Number',
  'PCP Name & NPI',
  'CPT Code',
  'Claim Reason',
  'Billing Month',
  'Generation Date',
  'Status',
  '',
];

// ─── Field (overview tab style) ───────────────────────────────────────────────

function Field({ label, value }: { label: string; value: React.ReactNode }): React.JSX.Element {
  return (
    <div>
      <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em] mb-1">{label}</p>
      <div className="text-[13.5px] text-foreground font-medium">{value || '—'}</div>
    </div>
  );
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────

function BillingDetailDialog({
  row,
  onClose,
  patient,
}: {
  row: BillingRow | null;
  onClose: () => void;
  patient?: PatientDetailData;
}): React.JSX.Element | null {
  if (!row) return null;

  return (
    <Dialog
      open={!!row}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[680px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Receipt size={15} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-[14px] font-bold leading-tight">Billing Record Details</DialogTitle>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">{row.invoiceNumber}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] space-y-0">
          {/* ── Invoice & CPT Details ── */}
          <div className="mb-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-4">
              Invoice & CPT Details
            </p>
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">
              <Field label="Invoice Number" value={row.invoiceNumber} />
              <Field
                label="Status"
                value={
                  <span
                    className={cn(
                      'inline-flex items-center text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border',
                      row.status === 'Generated'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    )}
                  >
                    {row.status}
                  </span>
                }
              />
              <Field label="CPT Code" value={row.cptCode} />
              <Field
                label="Program"
                value={
                  <span
                    className={cn(
                      'inline-flex items-center text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border',
                      PROGRAM_STYLE[row.program]
                    )}
                  >
                    {row.program}
                  </span>
                }
              />
              <div className="col-span-2">
                <Field label="CPT Description" value={row.cptDescription} />
              </div>
            </div>
          </div>

          {/* ── Session Timeline ── */}
          <div className="border-t border-slate-100 my-5" />
          <div className="mb-1">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={13} className="text-muted-foreground" />
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em]">
                Session Timeline
              </p>
              <span className="ml-auto text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15">
                {row.timeline.duration}
              </span>
            </div>

            {/* Participant Timeline */}
            {(() => {
              const ROLE_STYLE: Record<StepRole, { dot: string; badge: string }> = {
                Patient: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                RN: { dot: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700 border-violet-100' },
                DHN: { dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-100' },
                Physician: { dot: 'bg-primary', badge: 'bg-primary/8 text-primary border-primary/15' },
                System: { dot: 'bg-slate-300', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
              };
              const ROLE_FULL_NAME: Record<StepRole, string> = {
                Patient: 'Patient',
                RN: 'Registered Nurse',
                DHN: 'Digital Health Navigator',
                Physician: 'Physician',
                System: 'System',
              };
              return (
                <div className="relative pl-5">
                  {row.timeline.steps.map((step, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === row.timeline.steps.length - 1;
                    const style = ROLE_STYLE[step.role];
                    return (
                      <div key={idx} className="relative flex gap-4">
                        {/* Dot + dotted connector */}
                        <div className="flex flex-col items-center shrink-0" style={{ width: 12 }}>
                          <div
                            className={cn(
                              'w-3 h-3 rounded-full shrink-0 ring-4 mt-0.5',
                              isFirst
                                ? 'bg-emerald-500 ring-emerald-100'
                                : isLast
                                  ? 'bg-primary ring-primary/15'
                                  : style.dot + ' ring-slate-100'
                            )}
                          />
                          {!isLast && <div className="flex-1 w-px border-l-2 border-dashed border-slate-200 my-1.5" />}
                        </div>

                        {/* Content */}
                        <div className={cn('flex-1 pb-5', isLast && 'pb-0')}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[12px] font-semibold text-foreground">{step.label}</span>
                            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', style.badge)}>
                              {ROLE_FULL_NAME[step.role]}
                            </span>
                            {step.duration !== '—' && (
                              <span className="ml-auto text-[10.5px] font-semibold text-muted-foreground tabular-nums bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                                {step.duration}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">{step.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          <div className="border-t border-slate-100 my-5" />

          {/* ── Physician & Billing Period ── */}
          <div className="mb-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-4">
              Physician & Billing Period
            </p>
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">
              <Field label="PCP Name" value={row.pcpName} />
              <Field label="NPI Number" value={row.pcpNpi} />
              <Field label="Billing Month" value={row.billingMonth} />
              <Field label="Generation Date" value={formatDate(row.generationDate)} />
            </div>
          </div>

          <div className="border-t border-slate-100 my-5" />

          {/* ── Claim Reason ── */}
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-4">Claim Reason</p>
            <p className="text-[13.5px] text-foreground font-medium leading-relaxed">{row.claimReason}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-[13px] font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <Button onClick={() => generateAndDownloadInvoice(row, patient)} className="h-9 px-4 text-[13px] gap-2">
            <Download size={13} />
            Download Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BillingTab({ patient }: { patient?: PatientDetailData }): React.JSX.Element {
  const [programFilters, setProgramFilters] = useState<ProgramType[]>([]);
  const [monthFilter, setMonthFilter] = useState('');
  const [programOpen, setProgramOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<BillingRow | null>(null);
  const programRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (programRef.current && !programRef.current.contains(e.target as Node)) setProgramOpen(false);
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) setMonthOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const BILLING_MONTHS = useMemo(() => [...new Set(BILLING_ROWS.map((r) => r.billingMonth))], []);

  const filtered = useMemo(() => {
    return BILLING_ROWS.filter((r) => {
      if (programFilters.length > 0 && !programFilters.includes(r.program)) return false;
      if (monthFilter && r.billingMonth !== monthFilter) return false;
      return true;
    });
  }, [programFilters, monthFilter]);

  return (
    <>
      <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
        {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <p className="text-[13px] font-semibold text-foreground">Billing Records</p>

          <div className="flex items-center gap-2">
            {/* Month filter */}
            <div ref={monthRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setMonthOpen((o) => !o);
                  setProgramOpen(false);
                }}
                className={cn(
                  'h-8 px-3 flex items-center gap-2 rounded-lg border text-[12.5px] font-medium transition-colors',
                  monthFilter
                    ? 'border-primary/40 bg-primary/5 text-primary'
                    : 'border-slate-200 bg-slate-50 text-foreground hover:bg-slate-100'
                )}
              >
                <Filter size={12} />
                {monthFilter || 'Month'}
                <ChevronDown
                  size={12}
                  className={cn('text-muted-foreground transition-transform duration-150', monthOpen && 'rotate-180')}
                />
              </button>

              {monthOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-44 bg-white rounded-xl border border-slate-200 shadow-xs py-1.5 overflow-hidden">
                  {BILLING_MONTHS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMonthFilter(monthFilter === m ? '' : m);
                        setMonthOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3.5 py-2.5 text-[12.5px] font-medium transition-colors text-left',
                        monthFilter === m ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-slate-50'
                      )}
                    >
                      {m}
                      {monthFilter === m && <Check size={12} className="text-primary shrink-0" />}
                    </button>
                  ))}
                  {monthFilter && (
                    <>
                      <div className="mx-3.5 border-t border-slate-100 my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setMonthFilter('');
                          setMonthOpen(false);
                        }}
                        className="w-full px-3.5 py-2.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-slate-50 transition-colors text-left"
                      >
                        Clear filter
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Program filter — multi-select */}
            <div ref={programRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setProgramOpen((o) => !o);
                  setMonthOpen(false);
                }}
                className={cn(
                  'h-8 px-3 flex items-center gap-2 rounded-lg border text-[12.5px] font-medium transition-colors',
                  programFilters.length > 0
                    ? 'border-primary/40 bg-primary/5 text-primary'
                    : 'border-slate-200 bg-slate-50 text-foreground hover:bg-slate-100'
                )}
              >
                <Filter size={12} />
                {programFilters.length === 0
                  ? 'Program'
                  : programFilters.length === 1
                    ? programFilters[0]
                    : `${programFilters.length} Programs`}
                {programFilters.length > 0 && (
                  <span className="ml-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {programFilters.length}
                  </span>
                )}
                <ChevronDown
                  size={12}
                  className={cn('text-muted-foreground transition-transform duration-150', programOpen && 'rotate-180')}
                />
              </button>

              {programOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-44 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="py-1.5">
                    {(['RPM', 'APCM', 'BHI'] as const).map((opt) => {
                      const checked = programFilters.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setProgramFilters((prev) => (checked ? prev.filter((p) => p !== opt) : [...prev, opt]))
                          }
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div
                            className={cn(
                              'w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0',
                              checked ? 'bg-primary border-primary' : 'bg-white border-slate-300'
                            )}
                          >
                            {checked && <Check size={10} className="text-primary-foreground" strokeWidth={3} />}
                          </div>
                          <span
                            className={cn(
                              'text-[11px] font-semibold px-1.5 py-0.5 rounded-full border',
                              opt === 'RPM' && 'bg-blue-50 text-blue-700 border-blue-100',
                              opt === 'APCM' && 'bg-teal-50 text-teal-700 border-teal-100',
                              opt === 'BHI' && 'bg-violet-50 text-violet-700 border-violet-100'
                            )}
                          >
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {programFilters.length > 0 && (
                    <>
                      <div className="mx-3.5 border-t border-slate-100" />
                      <button
                        type="button"
                        onClick={() => setProgramFilters([])}
                        className="w-full px-3.5 py-2.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-slate-50 transition-colors text-left"
                      >
                        Clear filter
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────────── */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-[#FAFAF9]">
              {TABLE_HEADERS.map((h, i) => (
                <th
                  key={i}
                  className="px-5 py-3 text-left text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={22} className="text-slate-300" />
                    <p className="text-[13px] text-muted-foreground">No billing records found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedRow(row)}
                  className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  {/* Program */}
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        'inline-flex items-center text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border',
                        PROGRAM_STYLE[row.program]
                      )}
                    >
                      {row.program}
                    </span>
                  </td>

                  {/* Invoice Number */}
                  <td className="px-5 py-3.5">
                    <span className="text-[12.5px] font-medium text-foreground">{row.invoiceNumber}</span>
                  </td>

                  {/* PCP Name & NPI */}
                  <td className="px-5 py-3.5">
                    <p className="text-[12.5px] font-medium text-foreground">{row.pcpName}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">NPI: {row.pcpNpi}</p>
                  </td>

                  {/* CPT Code */}
                  <td className="px-5 py-3.5">
                    <p className="text-[12.5px] font-semibold text-foreground">{row.cptCode}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[180px] leading-snug">
                      {row.cptDescription}
                    </p>
                  </td>

                  {/* Claim Reason */}
                  <td className="px-5 py-3.5 max-w-[200px]">
                    <p className="text-[12px] text-muted-foreground leading-snug line-clamp-2">{row.claimReason}</p>
                  </td>

                  {/* Billing Month */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-[12.5px] text-foreground">{row.billingMonth}</span>
                  </td>

                  {/* Generation Date */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-[12.5px] text-foreground">{formatDate(row.generationDate)}</span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        'inline-flex items-center text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border',
                        row.status === 'Generated'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-600 border-amber-200'
                      )}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* Download */}
                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      title={`Download ${row.invoiceNumber}`}
                      onClick={() => generateAndDownloadInvoice(row, patient)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
                    >
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Footer ────────────────────────────────────────────────────────────── */}
        <div className="px-5 py-3 border-t border-slate-100">
          <span className="text-[12px] text-muted-foreground">
            Showing {filtered.length} of {BILLING_ROWS.length} records
          </span>
        </div>
      </div>

      {/* ── Detail Dialog ──────────────────────────────────────────────────────── */}
      <BillingDetailDialog row={selectedRow} onClose={() => setSelectedRow(null)} patient={patient} />
    </>
  );
}
