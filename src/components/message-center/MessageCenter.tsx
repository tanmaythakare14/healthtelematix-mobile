import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Edit3, MessageSquare, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'focused' | 'other';

interface Conversation {
  id: string;
  patientName: string;
  initials: string;
  color: string;
  lastMessage: string;
  time: string;
  unread: number;
  tab: Tab;
  online: boolean;
}

interface ChatMessage {
  id: string;
  senderInitials: string;
  isMe: boolean;
  content: string;
  time: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CONVERSATIONS: Conversation[] = [
  {
    id: 'c-001',
    patientName: 'Michael Thompson',
    initials: 'MT',
    color: 'bg-violet-100 text-violet-700',
    lastMessage: 'My BP reading was 148/92 this morning, feeling a bit dizzy',
    time: '2m',
    unread: 2,
    tab: 'focused',
    online: true,
  },
  {
    id: 'c-002',
    patientName: 'Emily Watson',
    initials: 'EW',
    color: 'bg-blue-100 text-blue-700',
    lastMessage: 'I took my Metformin as prescribed, feeling okay today',
    time: '1h',
    unread: 1,
    tab: 'focused',
    online: true,
  },
  {
    id: 'c-003',
    patientName: "James O'Brien",
    initials: 'JO',
    color: 'bg-emerald-100 text-emerald-700',
    lastMessage: 'When is my next follow-up appointment scheduled?',
    time: '3h',
    unread: 0,
    tab: 'focused',
    online: false,
  },
  {
    id: 'c-004',
    patientName: 'Sofia Martinez',
    initials: 'SM',
    color: 'bg-rose-100 text-rose-700',
    lastMessage: 'Blood sugar is 142 mg/dL before lunch, is that normal?',
    time: 'Yesterday',
    unread: 0,
    tab: 'other',
    online: false,
  },
  {
    id: 'c-005',
    patientName: 'David Chen',
    initials: 'DC',
    color: 'bg-amber-100 text-amber-700',
    lastMessage: "I've been having chest discomfort after walking a block",
    time: 'Yesterday',
    unread: 0,
    tab: 'other',
    online: false,
  },
];

const CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'c-001': [
    {
      id: 'm1',
      senderInitials: 'MT',
      isMe: false,
      content: "Good morning! I just took my BP reading and it shows 148/92. I'm feeling a bit dizzy.",
      time: '9:02 AM',
    },
    {
      id: 'm2',
      senderInitials: 'SM',
      isMe: true,
      content:
        "Good morning Michael. That reading is elevated. Please rest and avoid salt. I'll flag this for the physician right away.",
      time: '9:05 AM',
    },
    {
      id: 'm3',
      senderInitials: 'MT',
      isMe: false,
      content: 'Should I take an extra dose of Lisinopril?',
      time: '9:07 AM',
    },
    {
      id: 'm4',
      senderInitials: 'MT',
      isMe: false,
      content: 'Also, the dizziness gets worse when I stand up quickly.',
      time: '9:08 AM',
    },
  ],
  'c-002': [
    {
      id: 'm1',
      senderInitials: 'EW',
      isMe: false,
      content: 'Hi, I took my Metformin 500mg with breakfast as prescribed.',
      time: '8:30 AM',
    },
    {
      id: 'm2',
      senderInitials: 'SM',
      isMe: true,
      content: 'Great Emily! How are you feeling? Any side effects like nausea or stomach upset?',
      time: '8:45 AM',
    },
    {
      id: 'm3',
      senderInitials: 'EW',
      isMe: false,
      content: 'I took my Metformin as prescribed, feeling okay today.',
      time: '9:10 AM',
    },
  ],
  'c-003': [
    {
      id: 'm1',
      senderInitials: 'JO',
      isMe: false,
      content: 'Hello, I wanted to check on my EHR import status. Did my records come through from Epic?',
      time: 'Yesterday',
    },
    {
      id: 'm2',
      senderInitials: 'SM',
      isMe: true,
      content: 'Hi James! Yes, your records were successfully imported. Everything looks complete.',
      time: 'Yesterday',
    },
    {
      id: 'm3',
      senderInitials: 'JO',
      isMe: false,
      content: 'When is my next follow-up appointment scheduled?',
      time: '10:20 AM',
    },
  ],
  'c-004': [
    {
      id: 'm1',
      senderInitials: 'SM2',
      isMe: false,
      content: 'My blood sugar reads 142 mg/dL before lunch. Is that within my target range?',
      time: 'Yesterday',
    },
    {
      id: 'm2',
      senderInitials: 'SM',
      isMe: true,
      content:
        "Hi Sofia! That's slightly above target (80–130 mg/dL). Please log it and we'll review with Dr. Smith at your next visit.",
      time: 'Yesterday',
    },
  ],
  'c-005': [
    {
      id: 'm1',
      senderInitials: 'DC',
      isMe: false,
      content: "I've been having chest discomfort after walking about a block. It goes away when I rest.",
      time: 'Yesterday',
    },
    {
      id: 'm2',
      senderInitials: 'SM',
      isMe: true,
      content:
        "David, please do not exert yourself. I'm escalating this to Dr. Torres immediately. Can you come in today?",
      time: 'Yesterday',
    },
  ],
};

const ONBOARDING_PREFIXES = [
  '/login',
  '/sign-in',
  '/forgot-password',
  '/reset-password',
  '/email-verification',
  '/set-password',
  '/create-profile',
  '/review-users',
  '/review-ehr',
];

// ─── Component ────────────────────────────────────────────────────────────────

export function MessageCenter(): React.JSX.Element | null {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('focused');
  const [search, setSearch] = useState('');
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOnboarding = ONBOARDING_PREFIXES.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    if (activeConvId && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConvId]);

  if (isOnboarding) return null;

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  const filteredConvs = conversations.filter((c) => {
    const matchesTab = c.tab === tab;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || c.patientName.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  function handleOpen() {
    setOpen((o) => !o);
    if (open) setActiveConvId(null);
  }

  function openConversation(id: string) {
    setActiveConvId(id);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  }

  return (
    <div className="fixed bottom-0 right-6 z-50 w-[340px]">
      {/* ── Expanded panel ── */}
      <div
        className={cn(
          'bg-white border border-b-0 border-slate-200 rounded-t-2xl overflow-hidden transition-all duration-200',
          open ? 'h-[448px] opacity-100' : 'h-0 opacity-0 pointer-events-none'
        )}
      >
        {activeConv ? (
          /* ── Chat thread ── */
          <div className="flex flex-col h-full">
            {/* Chat sub-header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setActiveConvId(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-muted-foreground transition-colors"
              >
                <ArrowLeft size={14} />
              </button>
              <div className="relative shrink-0">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold',
                    activeConv.color
                  )}
                >
                  {activeConv.initials}
                </div>
                {activeConv.online && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
                  {activeConv.patientName}
                </p>
                {activeConv.online && (
                  <p className="text-[10.5px] text-emerald-600 font-medium leading-tight">Active now</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {(CHAT_MESSAGES[activeConv.id] ?? []).map((msg) => (
                <div key={msg.id} className={cn('flex gap-2', msg.isMe ? 'flex-row-reverse' : 'flex-row')}>
                  {!msg.isMe && (
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5',
                        activeConv.color
                      )}
                    >
                      {activeConv.initials}
                    </div>
                  )}
                  <div className={cn('max-w-[76%] flex flex-col', msg.isMe ? 'items-end' : 'items-start')}>
                    <div
                      className={cn(
                        'px-3 py-2 text-[12.5px] leading-snug',
                        msg.isMe
                          ? 'bg-primary text-white rounded-2xl rounded-tr-sm'
                          : 'bg-slate-100 text-foreground rounded-2xl rounded-tl-sm'
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Compose input */}
            <div className="px-3 py-2.5 border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <input
                  type="text"
                  placeholder="Write a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="flex-1 bg-transparent text-[12.5px] text-foreground placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>
          </div>
        ) : (
          /* ── Conversation list ── */
          <div className="flex flex-col h-full">
            {/* Search */}
            <div className="px-3 pt-3 pb-2 shrink-0">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search messages"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-[12.5px] text-foreground placeholder:text-slate-400 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10 transition-colors"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 shrink-0 px-1">
              {(['focused', 'other'] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    'flex-1 py-2.5 text-[12.5px] font-medium capitalize transition-colors border-b-2',
                    tab === t
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 pb-8">
                  <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <MessageSquare size={18} className="text-slate-400" />
                  </div>
                  <p className="text-[13px] font-semibold text-foreground">No messages</p>
                  <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug">
                    Patient messages will appear here
                  </p>
                </div>
              ) : (
                filteredConvs.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => openConversation(conv.id)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold',
                          conv.color
                        )}
                      >
                        {conv.initials}
                      </div>
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={cn(
                            'text-[13px] truncate',
                            conv.unread > 0 ? 'font-bold text-foreground' : 'font-semibold text-foreground'
                          )}
                        >
                          {conv.patientName}
                        </p>
                        <span
                          className={cn(
                            'text-[10.5px] shrink-0',
                            conv.unread > 0 ? 'text-primary font-semibold' : 'text-muted-foreground'
                          )}
                        >
                          {conv.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p
                          className={cn(
                            'text-[11.5px] truncate flex-1',
                            conv.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                          )}
                        >
                          {conv.lastMessage}
                        </p>
                        {conv.unread > 0 && (
                          <span className="shrink-0 min-w-[16px] h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center px-1">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Header bar (always visible) ── */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
        className={cn(
          'h-[52px] bg-white border border-slate-200 flex items-center justify-between px-4 cursor-pointer hover:bg-slate-50 transition-colors select-none',
          open ? 'rounded-none border-t-slate-100' : 'rounded-t-2xl shadow-lg'
        )}
      >
        <div className="flex items-center gap-2.5">
          {/* Staff avatar */}
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#2563EB] flex items-center justify-center text-white text-[11px] font-bold">
              SM
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <span className="text-[13.5px] font-bold text-foreground">Messaging</span>

          {totalUnread > 0 && (
            <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-white text-[9.5px] font-bold px-1">
              {totalUnread}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-muted-foreground transition-colors"
            aria-label="New message"
          >
            <Edit3 size={14} />
          </button>
          <div className="w-7 h-7 flex items-center justify-center text-muted-foreground">
            {open ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </div>
        </div>
      </div>
    </div>
  );
}
