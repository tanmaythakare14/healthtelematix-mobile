import React, { useRef, useEffect, useState } from 'react';
import { AlertTriangle, Bot, ChevronDown, MessageSquare, RefreshCw, Sparkles, UserRound, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type SenderRole = 'patient' | 'ai' | 'nurse' | 'dhn' | 'physician';
type SessionStatus = 'active' | 'resolved' | 'escalated';

interface Message {
  id: string;
  role: SenderRole;
  senderName: string;
  content: string;
  time: string;
}

interface Session {
  id: string;
  dateLabel: string;
  timeRange: string;
  preview: string;
  messageCount: number;
  participants: SenderRole[];
  status: SessionStatus;
  hasAlert: boolean;
  escalatedTo?: SenderRole;
  resolvedBy?: SenderRole;
}

type ScenarioStatus = 'Escalated to Health Navigator' | 'Escalated to Nurse' | 'Escalated to Physician' | 'Resolved';

interface ScenarioRow {
  role: SenderRole;
  participant: string;
  action: string;
  timeSpent: string;
  status: ScenarioStatus;
}

interface SessionSummary {
  sessionId: string;
  generatedAt: string;
  overview: string;
  actionItems: string[];
  scenarioFlow?: ScenarioRow[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SESSIONS: Session[] = [
  {
    id: 's-001',
    dateLabel: 'Apr 8, 2026',
    timeRange: '9:30 AM – 11:25 AM',
    preview: 'BP reading of 148/92 flagged. Physician scheduled telehealth at 3 PM.',
    messageCount: 10,
    participants: ['patient', 'ai', 'nurse', 'physician', 'dhn'],
    status: 'resolved',
    hasAlert: true,
    resolvedBy: 'physician',
  },
  {
    id: 's-002',
    dateLabel: 'Apr 7, 2026',
    timeRange: '7:12 AM – 7:45 AM',
    preview: 'Daily weight check completed. Weight stable at 172 lbs.',
    messageCount: 6,
    participants: ['patient', 'ai', 'nurse'],
    status: 'resolved',
    hasAlert: false,
    resolvedBy: 'nurse',
  },
  {
    id: 's-003',
    dateLabel: 'Apr 28, 2026',
    timeRange: '3:00 PM – 3:38 PM',
    preview: 'Medication adherence review. Lisinopril refill requested.',
    messageCount: 8,
    participants: ['patient', 'ai', 'nurse', 'dhn'],
    status: 'resolved',
    hasAlert: false,
    resolvedBy: 'nurse',
  },
  {
    id: 's-004',
    dateLabel: 'Apr 26, 2026',
    timeRange: '10:05 AM – 10:20 AM',
    preview: 'Patient reported mild dizziness. Nurse advised rest and hydration.',
    messageCount: 5,
    participants: ['patient', 'ai', 'nurse'],
    status: 'resolved',
    hasAlert: false,
    resolvedBy: 'nurse',
  },
];

const MESSAGES: Record<string, Message[]> = {
  's-001': [
    {
      id: 'm-001',
      role: 'patient',
      senderName: 'Eleanor Vance',
      content: 'Good morning. My blood pressure reading this morning was 148/92. Should I be concerned?',
      time: '9:30 AM',
    },
    {
      id: 'm-002',
      role: 'ai',
      senderName: 'AI Health Agent',
      content:
        'Good morning, Robert. A reading of 148/92 is elevated above your target range of 130/80. I have noted this in your record and alerted your care team. Can you confirm you have taken your morning medications?',
      time: '9:31 AM',
    },
    {
      id: 'm-003',
      role: 'patient',
      senderName: 'Eleanor Vance',
      content: 'Yes, I took my Lisinopril at 8 AM as scheduled.',
      time: '9:32 AM',
    },
    {
      id: 'm-004',
      role: 'ai',
      senderName: 'AI Health Agent',
      content:
        'Thank you. I have escalated this to your nurse for review. Please avoid strenuous activity until you hear back from your care team.',
      time: '9:33 AM',
    },
    {
      id: 'm-005',
      role: 'nurse',
      senderName: 'RN Jessica Park',
      content:
        'Hi Robert, I reviewed your reading. Since you have taken your medication, let us monitor for the next hour. If your systolic stays above 150 mmHg, please call us immediately.',
      time: '9:45 AM',
    },
    {
      id: 'm-006',
      role: 'patient',
      senderName: 'Eleanor Vance',
      content: 'Okay, I will check again at 10:30. Should I also reduce my salt intake today?',
      time: '9:50 AM',
    },
    {
      id: 'm-007',
      role: 'nurse',
      senderName: 'RN Jessica Park',
      content:
        'Absolutely. Keep sodium under 1,500 mg today and stay well hydrated. I will follow up after your 10:30 reading.',
      time: '9:52 AM',
    },
    {
      id: 'm-008',
      role: 'physician',
      senderName: 'Dr. Michael Torres',
      content:
        "Robert, I've reviewed your readings from this morning. Your BP trend this week is concerning. I'd like to schedule a telehealth call this afternoon. Are you available at 3 PM?",
      time: '11:10 AM',
    },
    {
      id: 'm-009',
      role: 'patient',
      senderName: 'Eleanor Vance',
      content: 'Yes, 3 PM works for me. Thank you, doctor.',
      time: '11:14 AM',
    },
    {
      id: 'm-010',
      role: 'dhn',
      senderName: 'Ethan Brooks',
      content:
        "Hi Robert! I've sent you a calendar invite for the 3 PM call. I've also shared a resource on low-sodium meal planning in your patient portal. Let me know if you have any questions before the call.",
      time: '11:25 AM',
    },
  ],
  's-002': [
    {
      id: 'm-201',
      role: 'ai',
      senderName: 'AI Health Agent',
      content: 'Good morning, Robert! Time for your daily weight check. Please log your weight when you get a moment.',
      time: '7:12 AM',
    },
    {
      id: 'm-202',
      role: 'patient',
      senderName: 'Eleanor Vance',
      content: 'Just weighed in — 172 lbs.',
      time: '7:18 AM',
    },
    {
      id: 'm-203',
      role: 'ai',
      senderName: 'AI Health Agent',
      content:
        'Weight logged: 172 lbs. That is stable compared to yesterday (171 lbs). No significant change. Keep up the good work!',
      time: '7:18 AM',
    },
    {
      id: 'm-204',
      role: 'nurse',
      senderName: 'RN Jessica Park',
      content:
        'Good morning, Robert. Weight looks stable — nice work staying consistent. How are you feeling overall today?',
      time: '7:30 AM',
    },
    {
      id: 'm-205',
      role: 'patient',
      senderName: 'Eleanor Vance',
      content: 'Feeling good today, thank you. No symptoms to report.',
      time: '7:40 AM',
    },
    {
      id: 'm-206',
      role: 'nurse',
      senderName: 'RN Jessica Park',
      content: "Great to hear. Stay hydrated and I'll check in again tomorrow. Have a great day!",
      time: '7:45 AM',
    },
  ],
};

const SUMMARIES: Record<string, SessionSummary> = {
  's-001': {
    sessionId: 's-001',
    generatedAt: 'Today at 11:30 AM',
    overview:
      'Eleanor Vance reported an elevated BP reading of 148/92 mmHg. The AI Health Agent escalated the alert to the care team after confirming medication adherence. RN Jessica Park advised monitoring and restricted sodium intake to under 1,500 mg. Dr. Michael Torres reviewed the weekly BP trend and scheduled a telehealth call at 3 PM, with Ethan Brooks (DHN) sending the calendar invite.',
    actionItems: [
      'Monitor BP at 10:30 AM — nurse to follow up',
      'Telehealth call at 3:00 PM (calendar invite sent)',
      'Review weekly BP trend before telehealth call',
    ],
    scenarioFlow: [
      {
        role: 'ai',
        participant: 'AI Agent',
        action: 'Initiated conversation, incorrectly routed escalation — sent to DHN instead of Digital Nurse',
        timeSpent: 'Auto',
        status: 'Escalated to Health Navigator',
      },
      {
        role: 'dhn',
        participant: 'Digital Health Navigator',
        action: 'Received case from AI, identified incorrect routing and escalated to Digital Nurse',
        timeSpent: 'Spent 0 mins',
        status: 'Escalated to Nurse',
      },
      {
        role: 'nurse',
        participant: 'Digital Nurse',
        action: 'Reviewed elevated BP reading, advised monitoring and sodium restriction',
        timeSpent: 'Spent 15 mins',
        status: 'Escalated to Physician',
      },
      {
        role: 'physician',
        participant: 'Physician',
        action: 'Reviewed weekly BP trend, scheduled telehealth call and resolved the case',
        timeSpent: 'Spent 20 mins',
        status: 'Resolved',
      },
    ],
  },
  's-002': {
    sessionId: 's-002',
    generatedAt: 'Yesterday at 7:50 AM',
    overview:
      'The AI Health Agent prompted the daily weight check. Eleanor Vance logged 172 lbs — stable from the previous day. RN Jessica Park reviewed the result, confirmed no symptoms, and advised continuing the daily monitoring routine.',
    actionItems: ['Continue daily weight check at same time each morning'],
  },
};

// ─── Role Config ──────────────────────────────────────────────────────────────

type RoleConfig = {
  label: string;
  avatarBg: string;
  bubbleBg: string;
  bubbleBorder: string;
  dot: string;
};

const ROLE_CONFIG: Record<SenderRole, RoleConfig> = {
  patient: {
    label: 'Patient',
    avatarBg: 'bg-teal-500',
    bubbleBg: 'bg-teal-50',
    bubbleBorder: 'border-l-2 border-teal-300',
    dot: 'bg-teal-400',
  },
  ai: {
    label: 'AI Agent',
    avatarBg: 'bg-violet-500',
    bubbleBg: 'bg-violet-50',
    bubbleBorder: 'border-l-2 border-violet-300',
    dot: 'bg-violet-400',
  },
  nurse: {
    label: 'Nurse',
    avatarBg: 'bg-emerald-500',
    bubbleBg: 'bg-white',
    bubbleBorder: 'border border-slate-200',
    dot: 'bg-emerald-400',
  },
  dhn: {
    label: 'DHN',
    avatarBg: 'bg-sky-500',
    bubbleBg: 'bg-sky-50',
    bubbleBorder: 'border-l-2 border-sky-300',
    dot: 'bg-sky-400',
  },
  physician: {
    label: 'Physician',
    avatarBg: 'bg-primary',
    bubbleBg: 'bg-primary/5',
    bubbleBorder: 'border-l-2 border-primary/40',
    dot: 'bg-primary',
  },
};

const STATUS_STYLE: Record<SessionStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  resolved: 'bg-slate-100 text-slate-500 border border-slate-200',
  escalated: 'bg-rose-50 text-rose-600 border border-rose-200',
};

function getSessionStatusLabel(session: Session): string {
  if (session.status === 'escalated' && session.escalatedTo) {
    return `Escalated to ${ROLE_CONFIG[session.escalatedTo].label}`;
  }
  if (session.status === 'resolved' && session.resolvedBy) {
    return `Resolved by ${ROLE_CONFIG[session.resolvedBy].label}`;
  }
  if (session.status === 'active') return 'Active';
  return session.status.charAt(0).toUpperCase() + session.status.slice(1);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, showSender }: { msg: Message; showSender: boolean }): React.JSX.Element {
  const cfg = ROLE_CONFIG[msg.role];
  const showHeader = showSender;

  return (
    <div className={cn('flex items-start gap-3', !showHeader && 'mt-1')}>
      {/* Avatar — all senders, first of consecutive group */}
      {showHeader ? (
        <div
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 text-white',
            cfg.avatarBg
          )}
        >
          {msg.role === 'ai' ? <Bot size={13} /> : getInitials(msg.senderName)}
        </div>
      ) : (
        <div className="w-7 shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        {/* Name + time — all senders, first of group */}
        {showHeader && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[12px] font-semibold text-foreground">{msg.senderName}</span>
            <span className="text-[10.5px] text-muted-foreground">{msg.time}</span>
          </div>
        )}

        <div
          className={cn(
            'px-3.5 py-2.5 rounded-xl text-[12.5px] text-foreground leading-relaxed w-full',
            showHeader ? 'rounded-tl-sm' : '',
            cfg.bubbleBg,
            cfg.bubbleBorder
          )}
        >
          {msg.content}
        </div>
      </div>
    </div>
  );
}

// ─── Scenario Status Badge ────────────────────────────────────────────────────

const SCENARIO_STATUS_STYLE: Record<ScenarioStatus, string> = {
  'Escalated to Health Navigator': 'bg-violet-50 text-violet-600 border border-violet-100',
  'Escalated to Nurse': 'bg-sky-50 text-sky-600 border border-sky-100',
  'Escalated to Physician': 'bg-amber-50 text-amber-600 border border-amber-100',
  Resolved: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
};

// ─── Scenario Flow Table ──────────────────────────────────────────────────────

function ScenarioFlowTable({ rows }: { rows: ScenarioRow[] }): React.JSX.Element {
  return (
    <div className="px-4 py-3">
      {rows.map((row, idx) => {
        const cfg = ROLE_CONFIG[row.role];
        const isLast = idx === rows.length - 1;
        return (
          <div key={idx} className="flex gap-3">
            {/* Left column — dot + dotted connector */}
            <div className="flex flex-col items-center shrink-0" style={{ width: '8px' }}>
              <div className={cn('w-2 h-2 rounded-full shrink-0 mt-[14px] z-10 ring-2 ring-white', cfg.dot)} />
              {!isLast && (
                <div
                  className="flex-1 mt-1"
                  style={{
                    width: '1px',
                    backgroundImage:
                      'repeating-linear-gradient(to bottom, #cbd5e1 0px, #cbd5e1 4px, transparent 4px, transparent 8px)',
                  }}
                />
              )}
            </div>

            {/* Right column — content */}
            <div className={cn('flex flex-col gap-1.5 min-w-0 flex-1', isLast ? 'pb-2' : 'pb-4')}>
              {/* Participant name + status badge */}
              <div className="flex items-start justify-between gap-2 pt-2.5">
                <span className="text-[12px] font-semibold text-foreground leading-tight truncate">
                  {row.participant}
                </span>
                <span
                  className={cn(
                    'text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 leading-tight whitespace-nowrap',
                    SCENARIO_STATUS_STYLE[row.status]
                  )}
                >
                  {row.status}
                </span>
              </div>

              {/* Action description */}
              <p className="text-[10.5px] text-slate-500 leading-snug">{row.action}</p>

              {/* Time spent pill */}
              <span className="inline-flex items-center gap-1.5 w-fit text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                <span className={cn('w-1 h-1 rounded-full shrink-0', cfg.dot)} />
                {row.timeSpent}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MessagesTab(): React.JSX.Element {
  const [activeSessionId, setActiveSessionId] = useState<string>('s-001');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);

  function handleRefreshSummary(): void {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }

  const activeMessages = MESSAGES[activeSessionId] ?? [];
  const activeSummary = SUMMARIES[activeSessionId];

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [activeSessionId]);

  return (
    <div className="flex gap-3.5 overflow-hidden" style={{ height: 'calc(100vh - 306px)', minHeight: '520px' }}>
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* LEFT PANEL — Session list                                             */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="w-[20%] shrink-0 flex flex-col rounded-[14px] border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={13} className="text-muted-foreground" />
              <h3 className="text-[12.5px] font-bold text-foreground">Sessions</h3>
            </div>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
              {SESSIONS.length}
            </span>
          </div>
        </div>

        {/* Session list — scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80">
          {SESSIONS.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => setActiveSessionId(session.id)}
                className={cn(
                  'relative w-full text-left px-3.5 py-3 transition-colors group',
                  isActive ? 'bg-primary/5' : 'hover:bg-slate-50'
                )}
              >
                {/* Date + status */}
                <div className="flex items-start justify-between gap-1.5 mb-1">
                  <span className={cn('text-[11px] font-bold shrink-0', isActive ? 'text-primary' : 'text-foreground')}>
                    {session.dateLabel}
                  </span>
                  <span
                    className={cn(
                      'text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 leading-tight',
                      STATUS_STYLE[session.status]
                    )}
                  >
                    {getSessionStatusLabel(session)}
                  </span>
                </div>

                {/* Time range */}
                <p className="text-[10px] text-muted-foreground mb-1.5">{session.timeRange}</p>

                {/* Preview */}
                <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 mb-2">{session.preview}</p>

                {/* Active indicator */}
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MIDDLE PANEL — Conversation history                                   */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col rounded-[14px] border border-slate-200 bg-white shadow-xs overflow-hidden min-w-0">
        {/* Read-only notice */}
        <div className="flex items-center gap-2 px-5 py-1.5 bg-slate-50 border-b border-slate-100 shrink-0">
          <UserRound size={10} className="text-muted-foreground shrink-0" />
          <p className="text-[10.5px] text-muted-foreground">
            View-only — Clinic Admin cannot send messages in this conversation.
          </p>
        </div>

        {/* AI Summary — collapsible */}
        {activeSummary && (
          <div className="shrink-0 border-b border-violet-100/80">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-violet-50/80 to-slate-50/40">
              {/* Icon */}
              <div className="w-7 h-7 rounded-lg bg-violet-100 border border-violet-200/70 flex items-center justify-center shrink-0">
                <Sparkles size={13} className="text-violet-500" />
              </div>

              {/* Title + timestamp — clickable to toggle */}
              <button
                type="button"
                onClick={() => setIsSummaryOpen((v) => !v)}
                className="flex-1 flex items-baseline gap-2 min-w-0 text-left"
              >
                <span className="text-[12.5px] font-bold text-violet-700 leading-none">AI Summary</span>
                <span className="text-[10px] text-violet-400/80 font-medium truncate">{activeSummary.generatedAt}</span>
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleRefreshSummary}
                  disabled={isRefreshing}
                  className="flex items-center gap-1 text-[10.5px] font-semibold text-primary hover:text-primary/70 transition-colors disabled:opacity-40"
                >
                  <RefreshCw size={10} className={cn(isRefreshing && 'animate-spin')} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setIsSummaryOpen((v) => !v)}
                  className="w-6 h-6 flex items-center justify-center rounded-md text-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                >
                  <ChevronDown
                    size={14}
                    className={cn('transition-transform duration-200', isSummaryOpen && 'rotate-180')}
                  />
                </button>
              </div>
            </div>

            {/* Expandable content */}
            {isSummaryOpen && (
              <div className="px-5 pt-3.5 pb-4 space-y-3.5 bg-gradient-to-b from-violet-50/30 to-white">
                {/* Overview */}
                <p className="text-[11.5px] text-slate-600 leading-relaxed">{activeSummary.overview}</p>

                {/* Disclaimer */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50/70 border border-amber-100">
                  <AlertTriangle size={10} className="text-amber-400 shrink-0" />
                  <p className="text-[10px] text-amber-600 font-medium">
                    AI-generated — verify critical points before acting.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages — scrollable */}
        <div ref={chatRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {activeMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
              <MessageSquare size={28} className="text-slate-200" />
              <p className="text-[12px] text-muted-foreground">No messages in this session.</p>
            </div>
          ) : (
            activeMessages.map((msg, i) => (
              <MessageBubble key={msg.id} msg={msg} showSender={i === 0 || activeMessages[i - 1].role !== msg.role} />
            ))
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* RIGHT PANEL — Participant Timeline                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="w-[20%] shrink-0 flex flex-col rounded-[14px] border border-slate-200 bg-white shadow-xs overflow-hidden min-w-0">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
              <Users size={12} className="text-slate-500" />
            </div>
            <h3 className="text-[12.5px] font-bold text-foreground leading-tight">Participant Timeline</h3>
          </div>
        </div>

        {/* Participant flow — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {!activeSummary?.scenarioFlow ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-5">
              <Bot size={28} className="text-slate-200" />
              <p className="text-[11.5px] text-muted-foreground">No participant data for this session.</p>
            </div>
          ) : (
            <ScenarioFlowTable rows={activeSummary.scenarioFlow} />
          )}
        </div>
      </div>
    </div>
  );
}
