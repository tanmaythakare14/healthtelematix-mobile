import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Bell,
  ChevronRight,
  ChevronLeft,
  Heart,
  Activity,
  TrendingUp,
  Search,
  Plus,
  AlertCircle,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Wifi,
  Signal,
  FileText,
  Shield,
  ChevronDown,
  BarChart3,
  CheckCircle2,
  Loader2,
  LayoutDashboard,
  ClipboardList,
  Pill as PillIcon,
  Bluetooth,
  Watch,
  CheckCheck,
  Circle,
  BatteryMedium,
  RefreshCw,
} from 'lucide-react';

// ─── mock data ────────────────────────────────────────────────────────────────

const MESSAGES = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    initials: 'SM',
    msg: 'My BP reading is showing 158/94 again…',
    time: '10:23 AM',
    unread: 2,
    critical: true,
    color: 'red',
  },
  {
    id: '2',
    name: 'Maria Gonzalez',
    initials: 'MG',
    msg: 'When is my next appointment scheduled?',
    time: 'Yesterday',
    unread: 1,
    critical: false,
    color: 'purple',
  },
  {
    id: '3',
    name: 'James Thornton',
    initials: 'JT',
    msg: 'Thank you for the medication update.',
    time: 'Mon',
    unread: 0,
    critical: false,
    color: 'blue',
  },
  {
    id: '4',
    name: 'Robert Chen',
    initials: 'RC',
    msg: 'I completed the breathing exercises today.',
    time: 'Sun',
    unread: 0,
    critical: false,
    color: 'green',
  },
] as const;

// ─── palettes ─────────────────────────────────────────────────────────────────

const AVATAR_BG: Record<string, string> = {
  red: 'linear-gradient(135deg,#FF6B6B,#EF4444)',
  blue: 'linear-gradient(135deg,#60A5FA,#2563EB)',
  purple: 'linear-gradient(135deg,#C084FC,#7C3AED)',
  green: 'linear-gradient(135deg,#34D399,#059669)',
  orange: 'linear-gradient(135deg,#FCA85F,#EA580C)',
};

// ─── shared primitives ────────────────────────────────────────────────────────

const SF: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
};

function Avatar({
  initials,
  size = 42,
  color = 'blue',
  dot = false,
}: {
  initials: string;
  size?: number;
  color?: string;
  dot?: boolean;
}): React.JSX.Element {
  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center rounded-full text-white font-bold"
      style={{ width: size, height: size, fontSize: size * 0.36, background: AVATAR_BG[color] ?? AVATAR_BG.blue }}
    >
      {initials}
      {dot && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />}
    </div>
  );
}

function Sep(): React.JSX.Element {
  return <div style={{ height: '1px', background: '#F2F2F7' }} />;
}

// ─── sign in screen ───────────────────────────────────────────────────────────

function SignInScreen({ onContinue }: { onContinue: () => void }): React.JSX.Element {
  const [pressed, setPressed] = useState(false);
  const handleContinue = () => {
    setPressed(true);
    setTimeout(onContinue, 150);
  };

  return (
    <div className="h-full flex flex-col bg-white" style={SF}>
      <div className="flex-1 flex flex-col px-7 pt-6 pb-4">
        {/* logo */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg,#007AFF 0%,#0040CC 100%)',
              boxShadow: '0 4px 12px rgba(0,122,255,0.35)',
            }}
          >
            <Heart size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[13px] font-bold leading-tight" style={{ color: '#1C1C1E', letterSpacing: '-0.2px' }}>
              Health Telematix
            </p>
            <p className="text-[10px] font-medium" style={{ color: '#8E8E93' }}>
              Patient Portal
            </p>
          </div>
        </div>

        {/* heading */}
        <div className="mb-8">
          <h1
            className="font-bold leading-none mb-2"
            style={{ fontSize: '30px', color: '#1C1C1E', letterSpacing: '-0.8px', lineHeight: 1.05 }}
          >
            Welcome
            <br />
            back 👋
          </h1>
          <p className="text-[13px] leading-snug" style={{ color: '#8E8E93' }}>
            Enter your mobile number to sign in to your account
          </p>
        </div>

        <p className="text-[10px] font-bold uppercase mb-2" style={{ color: '#8E8E93', letterSpacing: '0.8px' }}>
          Mobile Number
        </p>

        {/* phone input */}
        <div
          className="flex items-center rounded-2xl overflow-hidden mb-3"
          style={{ background: '#F7F8FA', border: '1.5px solid #E5E7EB', height: '54px' }}
        >
          <div
            className="flex items-center gap-1.5 px-4 h-full flex-shrink-0"
            style={{ borderRight: '1.5px solid #E5E7EB' }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>🇺🇸</span>
            <span className="text-[14px] font-semibold" style={{ color: '#1C1C1E' }}>
              +1
            </span>
            <ChevronDown size={11} style={{ color: '#8E8E93' }} />
          </div>
          <div className="flex-1 flex items-center px-4">
            <span className="text-[15px] font-medium" style={{ color: '#1C1C1E' }}>
              (555) 234‑5678
            </span>
            <div
              className="ml-0.5 animate-pulse"
              style={{ width: '1.5px', height: '18px', background: '#007AFF', borderRadius: '1px' }}
            />
          </div>
        </div>

        {/* hint */}
        <div
          className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl mb-8"
          style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
        >
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: '#3B82F6' }}
          >
            <span className="text-white font-bold" style={{ fontSize: '9px' }}>
              i
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#1D4ED8', lineHeight: 1.4 }}>
            Tap <strong>Continue</strong> to see the OTP verification flow
          </p>
        </div>

        <button
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 rounded-2xl"
          style={{
            height: '54px',
            background: 'linear-gradient(135deg,#007AFF 0%,#0040CC 100%)',
            boxShadow: '0 8px 24px rgba(0,122,255,0.38)',
            transform: pressed ? 'scale(0.97)' : 'scale(1)',
            transition: 'transform 0.1s',
          }}
        >
          <span className="text-white font-bold" style={{ fontSize: '16px', letterSpacing: '-0.3px' }}>
            Continue
          </span>
          <ArrowRight size={17} className="text-white" strokeWidth={2.5} />
        </button>
      </div>

      <div className="px-7 pb-6 flex flex-col items-center gap-2">
        <p style={{ fontSize: '12px', color: '#8E8E93' }}>
          Having trouble? <span style={{ color: '#007AFF', fontWeight: 600 }}>Contact support</span>
        </p>
        <div className="flex items-center gap-1.5">
          <Shield size={10} style={{ color: '#C7C7CC' }} />
          <p style={{ fontSize: '10px', color: '#C7C7CC' }}>HIPAA compliant · End-to-end encrypted</p>
        </div>
      </div>
    </div>
  );
}

// ─── otp screen ───────────────────────────────────────────────────────────────

const OTP_CODE = ['4', '2', '7', '8', '3', '1'];

function OtpScreen({ onVerify, onBack }: { onVerify: () => void; onBack: () => void }): React.JSX.Element {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const filled = digits.filter(Boolean).length;
  const allFilled = filled === 6;

  useEffect(() => {
    const timers = OTP_CODE.map((d, i) =>
      setTimeout(
        () =>
          setDigits((prev) => {
            const n = [...prev];
            n[i] = d;
            return n;
          }),
        600 + i * 380
      )
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const handleVerify = () => {
    if (!allFilled || verifying) return;
    setVerifying(true);
    setTimeout(() => {
      setVerified(true);
      setTimeout(onVerify, 700);
    }, 1400);
  };

  return (
    <div className="h-full flex flex-col bg-white" style={SF}>
      <div className="px-5 pt-4 pb-1">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: '#F2F2F7' }}
        >
          <ChevronLeft size={18} style={{ color: '#1C1C1E' }} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-7 pt-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' }}
        >
          <MessageSquare size={26} style={{ color: '#007AFF' }} strokeWidth={1.75} />
        </div>

        <div className="mb-7">
          <h1
            className="font-bold mb-2"
            style={{ fontSize: '28px', color: '#1C1C1E', letterSpacing: '-0.6px', lineHeight: 1.08 }}
          >
            Verify your
            <br />
            number
          </h1>
          <p className="text-[13px]" style={{ color: '#8E8E93', lineHeight: 1.5 }}>
            We sent a 6-digit code to
          </p>
          <p className="text-[14px] font-semibold" style={{ color: '#1C1C1E' }}>
            +1 (555) 234‑5678
          </p>
        </div>

        {/* OTP boxes */}
        <div className="flex gap-2 mb-5">
          {digits.map((d, i) => {
            const isActive = i === filled && !allFilled;
            const isFilled = d !== '';
            return (
              <div
                key={i}
                className="flex-1 flex items-center justify-center rounded-2xl"
                style={{
                  height: '56px',
                  background: isFilled ? '#F0F7FF' : '#F7F8FA',
                  border: `2px solid ${isActive ? '#007AFF' : isFilled ? '#BFDBFE' : '#E5E7EB'}`,
                  transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: isFilled ? 'scale(1)' : 'scale(0.97)',
                }}
              >
                {isFilled ? (
                  <span
                    className="font-bold"
                    style={{
                      fontSize: '22px',
                      color: '#007AFF',
                      animation: 'htx-pop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                    }}
                  >
                    {d}
                  </span>
                ) : isActive ? (
                  <div
                    className="animate-pulse"
                    style={{ width: '2px', height: '22px', background: '#007AFF', borderRadius: '1px' }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-7">
          <p style={{ fontSize: '12px', color: '#8E8E93' }}>Didn't receive a code?</p>
          {countdown > 0 ? (
            <p style={{ fontSize: '12px', color: '#8E8E93' }}>
              Resend in{' '}
              <span style={{ color: '#007AFF', fontWeight: 600 }}>0:{String(countdown).padStart(2, '0')}</span>
            </p>
          ) : (
            <button onClick={() => setCountdown(30)}>
              <span style={{ fontSize: '12px', color: '#007AFF', fontWeight: 600 }}>Resend now</span>
            </button>
          )}
        </div>

        <button
          onClick={handleVerify}
          className="w-full flex items-center justify-center gap-2 rounded-2xl mb-4"
          style={{
            height: '54px',
            background: allFilled
              ? verified
                ? 'linear-gradient(135deg,#34C759,#1E9E3E)'
                : 'linear-gradient(135deg,#007AFF,#0040CC)'
              : '#F2F2F7',
            boxShadow: allFilled ? '0 8px 24px rgba(0,122,255,0.35)' : 'none',
            transition: 'all 0.25s',
            cursor: allFilled ? 'pointer' : 'default',
          }}
        >
          {verifying && !verified ? (
            <>
              <Loader2 size={18} className="text-white animate-spin" />
              <span className="text-white font-bold" style={{ fontSize: '15px' }}>
                Verifying…
              </span>
            </>
          ) : verified ? (
            <>
              <CheckCircle2 size={18} className="text-white" />
              <span className="text-white font-bold" style={{ fontSize: '15px' }}>
                Verified!
              </span>
            </>
          ) : (
            <span
              className="font-bold"
              style={{ fontSize: '15px', color: allFilled ? '#fff' : '#C7C7CC', letterSpacing: '-0.2px' }}
            >
              Verify &amp; Sign In
            </span>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 py-3 rounded-xl" style={{ background: '#F7F8FA' }}>
          <span style={{ fontSize: '15px' }}>📲</span>
          <p style={{ fontSize: '11px', color: '#8E8E93' }}>Auto-fill from Messages</p>
        </div>
      </div>

      <div className="px-7 pb-6 flex items-center justify-center gap-1.5">
        <Shield size={10} style={{ color: '#C7C7CC' }} />
        <p style={{ fontSize: '10px', color: '#C7C7CC' }}>Secure one-time password · HIPAA compliant</p>
      </div>
    </div>
  );
}

// ─── dashboard screen ─────────────────────────────────────────────────────────

function DashboardScreen(): React.JSX.Element {
  const bars = [45, 62, 58, 71, 83, 76, 89];
  const peak = Math.max(...bars);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="h-full overflow-y-auto" style={{ ...SF, background: '#F2F2F7', scrollbarWidth: 'none' }}>
      {/* greeting */}
      <div className="px-5 pt-4 pb-3 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium" style={{ color: '#8E8E93' }}>
              Thursday, May 22
            </p>
            <h1
              className="text-[20px] font-bold leading-tight mt-0.5"
              style={{ color: '#1C1C1E', letterSpacing: '-0.4px' }}
            >
              Good morning,
              <br />
              <span style={{ color: '#007AFF' }}>Sarah Mitchell</span>
            </h1>
          </div>
          <div className="relative mt-1">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: '#F2F2F7' }}
            >
              <Bell size={18} style={{ color: '#1C1C1E' }} />
            </button>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white font-bold" style={{ fontSize: '8px' }}>
                3
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="flex gap-2 px-4 pt-3 pb-1">
        {[
          { label: 'BP Today', value: '158/94', delta: '+8', up: false, color: '#FF3B30', Icon: Heart },
          { label: 'Heart Rate', value: '88 bpm', delta: '-4', up: true, color: '#007AFF', Icon: Activity },
          { label: 'SpO₂', value: '97%', delta: '+1', up: true, color: '#34C759', Icon: TrendingUp },
        ].map(({ label, value, delta, up, color, Icon }) => (
          <div
            key={label}
            className="flex-1 rounded-2xl p-3 bg-white"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center mb-2"
              style={{ background: `${color}18` }}
            >
              <Icon size={13} style={{ color }} />
            </div>
            <p className="text-[9px] font-medium leading-none mb-1" style={{ color: '#8E8E93' }}>
              {label}
            </p>
            <p className="text-[13px] font-bold leading-none" style={{ color: '#1C1C1E', letterSpacing: '-0.3px' }}>
              {value}
            </p>
            <div className="flex items-center gap-0.5 mt-1">
              {up ? (
                <ArrowUpRight size={9} style={{ color: '#34C759' }} />
              ) : (
                <ArrowDownRight size={9} style={{ color: '#FF3B30' }} />
              )}
              <span className="text-[9px] font-bold" style={{ color: up ? '#34C759' : '#FF3B30' }}>
                {delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* chart */}
      <div className="mx-4 mt-3 rounded-2xl p-4 bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[13px] font-semibold" style={{ color: '#1C1C1E' }}>
              Vitals Trend
            </p>
            <p className="text-[10px]" style={{ color: '#8E8E93' }}>
              Last 7 days · Blood Pressure
            </p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: '#FF3B3014' }}>
            <TrendingUp size={10} style={{ color: '#FF3B30' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#FF3B30' }}>
              High
            </span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-14">
          {bars.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                style={{
                  height: `${(v / peak) * 44}px`,
                  width: '100%',
                  borderRadius: '3px 3px 0 0',
                  background: i === bars.length - 1 ? '#FF3B30' : 'rgba(255,59,48,0.18)',
                }}
              />
              <span style={{ fontSize: '8px', color: '#8E8E93' }}>{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* alerts */}
      <div
        className="mx-4 mt-3 rounded-2xl overflow-hidden bg-white"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-[13px] font-semibold" style={{ color: '#1C1C1E' }}>
            Active Alerts
          </p>
          <span className="text-[11px] font-medium" style={{ color: '#007AFF' }}>
            See all
          </span>
        </div>
        <Sep />
        {[
          { msg: 'BP 158/94 — above threshold', ago: '10 min ago', sev: 'critical' },
          { msg: 'Missed Lisinopril dose today', ago: '2 hrs ago', sev: 'warning' },
          { msg: 'Telehealth call in 3 days', ago: '4 hrs ago', sev: 'info' },
        ].map(({ msg, ago, sev }, i) => {
          const c = sev === 'critical' ? '#FF3B30' : sev === 'warning' ? '#FF9500' : '#007AFF';
          return (
            <div key={i}>
              <div className="flex items-start gap-3 px-4 py-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${c}15` }}
                >
                  <AlertCircle size={12} style={{ color: c }} />
                </div>
                <p className="flex-1 text-[11px] leading-tight" style={{ color: '#1C1C1E' }}>
                  {msg}
                </p>
                <span style={{ fontSize: '9px', color: '#C7C7CC', whiteSpace: 'nowrap' }}>{ago}</span>
              </div>
              {i < 2 && <Sep />}
            </div>
          );
        })}
      </div>

      {/* quick actions */}
      <div className="px-4 mt-4 mb-6">
        <p className="text-[13px] font-semibold mb-3" style={{ color: '#1C1C1E' }}>
          Quick Actions
        </p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { Icon: Plus, label: 'Log BP', color: '#FF3B30' },
            { Icon: Calendar, label: 'Schedule', color: '#34C759' },
            { Icon: FileText, label: 'Records', color: '#FF9500' },
            { Icon: BarChart3, label: 'Reports', color: '#AF52DE' },
          ].map(({ Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: `${color}15` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 500, color: '#8E8E93' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── care plan screen ─────────────────────────────────────────────────────────

function CarePlanScreen(): React.JSX.Element {
  const goals = [
    { label: 'Blood Pressure', target: '< 140/90 mmHg', current: '158/94', progress: 55, color: '#FF3B30' },
    { label: 'Daily Steps', target: '8,000 steps/day', current: '6,240', progress: 78, color: '#007AFF' },
    { label: 'Sodium Intake', target: '< 2g / day', current: '1.8g', progress: 85, color: '#34C759' },
    { label: 'Weight', target: '< 180 lbs', current: '187 lbs', progress: 40, color: '#FF9500' },
  ];
  const tasks = [
    { label: 'BP Reading', due: 'Today 2:00 PM', done: true, color: '#34C759' },
    { label: 'Medication Refill', due: 'May 25', done: false, color: '#007AFF' },
    { label: 'Telehealth Call', due: 'May 28 10 AM', done: false, color: '#AF52DE' },
  ];

  return (
    <div className="h-full overflow-y-auto" style={{ ...SF, background: '#F2F2F7', scrollbarWidth: 'none' }}>
      <div className="px-5 pt-4 pb-3 bg-white">
        <h1 className="text-[20px] font-bold mb-2" style={{ color: '#1C1C1E', letterSpacing: '-0.4px' }}>
          Care Plan
        </h1>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: '#F0F7FF', border: '1px solid #BFDBFE' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#FF6B6B,#EF4444)' }}
          >
            <span className="text-white font-bold" style={{ fontSize: '10px' }}>
              SM
            </span>
          </div>
          <div>
            <p className="text-[12px] font-semibold" style={{ color: '#1C1C1E' }}>
              Sarah Mitchell
            </p>
            <p className="text-[10px]" style={{ color: '#8E8E93' }}>
              Hypertension · RPM Program
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-3">
        <p className="text-[13px] font-semibold mb-2" style={{ color: '#1C1C1E' }}>
          Health Goals
        </p>
        <div className="space-y-2">
          {goals.map((g) => (
            <div key={g.label} className="rounded-2xl p-4 bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[12px] font-semibold" style={{ color: '#1C1C1E' }}>
                    {g.label}
                  </p>
                  <p className="text-[10px]" style={{ color: '#8E8E93' }}>
                    Target: {g.target}
                  </p>
                </div>
                <span className="text-[13px] font-bold" style={{ color: g.color }}>
                  {g.current}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F2F2F7' }}>
                <div style={{ width: `${g.progress}%`, height: '100%', background: g.color, borderRadius: '999px' }} />
              </div>
              <p className="text-[9px] mt-1 text-right font-semibold" style={{ color: g.color }}>
                {g.progress}%
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-4 mb-6">
        <p className="text-[13px] font-semibold mb-2" style={{ color: '#1C1C1E' }}>
          Upcoming Tasks
        </p>
        <div className="rounded-2xl overflow-hidden bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {tasks.map(({ label, due, done, color }, i) => (
            <div key={label}>
              <div className="flex items-center gap-3 px-4 py-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: done ? '#34C75918' : `${color}18` }}
                >
                  {done ? (
                    <CheckCheck size={13} style={{ color: '#34C759' }} />
                  ) : (
                    <Circle size={13} style={{ color }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[12px] font-semibold"
                    style={{ color: done ? '#8E8E93' : '#1C1C1E', textDecoration: done ? 'line-through' : 'none' }}
                  >
                    {label}
                  </p>
                  <p className="text-[10px]" style={{ color: '#8E8E93' }}>
                    {due}
                  </p>
                </div>
                <ChevronRight size={13} style={{ color: '#C7C7CC' }} />
              </div>
              {i < tasks.length - 1 && <Sep />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── medication screen ────────────────────────────────────────────────────────

function MedicationScreen(): React.JSX.Element {
  const meds = [
    {
      name: 'Lisinopril',
      dose: '10mg',
      freq: 'Once daily',
      lastTaken: 'Today 8:00 AM',
      adherence: 95,
      color: '#007AFF',
    },
    {
      name: 'Amlodipine',
      dose: '5mg',
      freq: 'Once daily',
      lastTaken: 'Today 8:00 AM',
      adherence: 88,
      color: '#34C759',
    },
    {
      name: 'Hydrochlorothiazide',
      dose: '12.5mg',
      freq: 'Once daily',
      lastTaken: 'Yesterday 9:00 AM',
      adherence: 72,
      color: '#FF9500',
    },
    { name: 'Aspirin', dose: '81mg', freq: 'Once daily', lastTaken: 'Today 8:00 AM', adherence: 98, color: '#AF52DE' },
  ];

  return (
    <div className="h-full overflow-y-auto" style={{ ...SF, background: '#F2F2F7', scrollbarWidth: 'none' }}>
      <div className="px-5 pt-4 pb-3 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[20px] font-bold" style={{ color: '#1C1C1E', letterSpacing: '-0.4px' }}>
            Medications
          </h1>
          <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#007AFF' }}>
            <Plus size={16} className="text-white" />
          </button>
        </div>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: '#F0FFF4', border: '1px solid #BBF7D0' }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#34C75918' }}
          >
            <CheckCircle2 size={16} style={{ color: '#34C759' }} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold" style={{ color: '#1C1C1E' }}>
              Overall Adherence
            </p>
            <p className="text-[10px]" style={{ color: '#34C759' }}>
              88% this week · Great job!
            </p>
          </div>
          <span className="text-[20px] font-bold" style={{ color: '#34C759', letterSpacing: '-0.5px' }}>
            88%
          </span>
        </div>
      </div>
      <div className="mx-4 mt-3 mb-6 space-y-2">
        {meds.map((med) => (
          <div key={med.name} className="rounded-2xl p-4 bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${med.color}18` }}
              >
                <PillIcon size={18} style={{ color: med.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <p className="text-[13px] font-semibold leading-tight" style={{ color: '#1C1C1E' }}>
                    {med.name}
                  </p>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: `${med.color}18`, color: med.color }}
                  >
                    {med.dose}
                  </span>
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: '#8E8E93' }}>
                  {med.freq}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock size={9} style={{ color: '#C7C7CC' }} />
                  <span style={{ fontSize: '9px', color: '#C7C7CC' }}>Last: {med.lastTaken}</span>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: '9px', color: '#8E8E93', fontWeight: 500 }}>Adherence</span>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: med.adherence >= 90 ? '#34C759' : med.adherence >= 75 ? '#FF9500' : '#FF3B30',
                  }}
                >
                  {med.adherence}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F2F2F7' }}>
                <div
                  style={{
                    width: `${med.adherence}%`,
                    height: '100%',
                    background: med.adherence >= 90 ? '#34C759' : med.adherence >= 75 ? '#FF9500' : '#FF3B30',
                    borderRadius: '999px',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── devices screen ───────────────────────────────────────────────────────────

function DevicesScreen(): React.JSX.Element {
  type Device = {
    name: string;
    model: string;
    Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
    lastSync: string;
    reading: string;
    battery: number;
    status: string;
    color: string;
  };
  const devices: Device[] = [
    {
      name: 'BP Monitor',
      model: 'Omron HEM-7121',
      Icon: Heart,
      lastSync: '10 min ago',
      reading: '158/94 mmHg',
      battery: 78,
      status: 'connected',
      color: '#FF3B30',
    },
    {
      name: 'Weight Scale',
      model: 'Withings Body+',
      Icon: Activity,
      lastSync: '1 day ago',
      reading: '187.2 lbs',
      battery: 45,
      status: 'connected',
      color: '#34C759',
    },
    {
      name: 'Pulse Oximeter',
      model: 'iHealth Air',
      Icon: TrendingUp,
      lastSync: '2 hrs ago',
      reading: 'SpO₂ 97%',
      battery: 92,
      status: 'connected',
      color: '#007AFF',
    },
    {
      name: 'Smart Watch',
      model: 'Apple Watch S9',
      Icon: Watch,
      lastSync: '5 min ago',
      reading: 'HR 88 bpm',
      battery: 63,
      status: 'syncing',
      color: '#AF52DE',
    },
  ];

  return (
    <div className="h-full overflow-y-auto" style={{ ...SF, background: '#F2F2F7', scrollbarWidth: 'none' }}>
      <div className="px-5 pt-4 pb-3 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[20px] font-bold" style={{ color: '#1C1C1E', letterSpacing: '-0.4px' }}>
            Devices
          </h1>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: '#007AFF15' }}>
            <Bluetooth size={12} style={{ color: '#007AFF' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#007AFF' }}>
              Scan
            </span>
          </button>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: '#F0FFF4', border: '1px solid #BBF7D0' }}
        >
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#34C759' }} />
          <p className="text-[11px] font-medium" style={{ color: '#059669' }}>
            4 devices connected · All readings synced
          </p>
        </div>
      </div>
      <div className="mx-4 mt-3 mb-6 space-y-2">
        {devices.map((dev) => {
          const Icon = dev.Icon;
          const battColor = dev.battery > 60 ? '#34C759' : dev.battery > 30 ? '#FF9500' : '#FF3B30';
          return (
            <div
              key={dev.name}
              className="rounded-2xl p-4 bg-white"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${dev.color}18` }}
                >
                  <Icon size={20} style={{ color: dev.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold" style={{ color: '#1C1C1E' }}>
                      {dev.name}
                    </p>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: dev.status === 'connected' ? '#34C759' : '#FF9500' }}
                      />
                      <span
                        className="text-[9px] font-medium capitalize"
                        style={{ color: dev.status === 'connected' ? '#34C759' : '#FF9500' }}
                      >
                        {dev.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: '#8E8E93' }}>
                    {dev.model}
                  </p>
                  <p className="text-[12px] font-semibold mt-1" style={{ color: '#1C1C1E' }}>
                    {dev.reading}
                  </p>
                </div>
              </div>
              <Sep />
              <div className="flex items-center justify-between pt-2.5">
                <div className="flex items-center gap-1">
                  <Clock size={9} style={{ color: '#C7C7CC' }} />
                  <span style={{ fontSize: '9px', color: '#C7C7CC' }}>Synced {dev.lastSync}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BatteryMedium size={13} style={{ color: battColor }} />
                  <span style={{ fontSize: '10px', fontWeight: 600, color: battColor }}>{dev.battery}%</span>
                  <button
                    className="ml-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: '#007AFF15' }}
                  >
                    <RefreshCw size={10} style={{ color: '#007AFF' }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── messages screen ──────────────────────────────────────────────────────────

function MessagesScreen(): React.JSX.Element {
  return (
    <div className="h-full flex flex-col" style={{ ...SF, background: '#F2F2F7' }}>
      <div className="px-5 pt-4 pb-3 bg-white">
        <h1 className="text-[20px] font-bold mb-3" style={{ color: '#1C1C1E', letterSpacing: '-0.4px' }}>
          Messages
        </h1>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#F2F2F7' }}>
          <Search size={13} style={{ color: '#8E8E93' }} />
          <span className="text-[13px]" style={{ color: '#8E8E93' }}>
            Search conversations…
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-white" style={{ scrollbarWidth: 'none' }}>
        {MESSAGES.map((m, i) => (
          <div key={m.id}>
            <div className="flex items-center gap-3 px-4 py-3">
              <Avatar initials={m.initials} size={46} color={m.color} dot={m.critical} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold" style={{ color: '#1C1C1E' }}>
                    {m.name}
                  </p>
                  <span style={{ fontSize: '10px', color: '#8E8E93' }}>{m.time}</span>
                </div>
                <p
                  className="text-[11px] truncate mt-0.5"
                  style={{ color: m.unread > 0 ? '#1C1C1E' : '#8E8E93', fontWeight: m.unread > 0 ? 600 : 400 }}
                >
                  {m.msg}
                </p>
              </div>
              {m.unread > 0 && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: '#007AFF' }}
                >
                  <span className="text-white font-bold" style={{ fontSize: '9px' }}>
                    {m.unread}
                  </span>
                </div>
              )}
            </div>
            {i < MESSAGES.length - 1 && (
              <div className="ml-[76px]">
                <Sep />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ios chrome ───────────────────────────────────────────────────────────────

function StatusBar({ dark = false }: { dark?: boolean }): React.JSX.Element {
  const [time, setTime] = useState(() => {
    const n = new Date();
    return `${n.getHours() % 12 || 12}:${String(n.getMinutes()).padStart(2, '0')}`;
  });
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setTime(`${n.getHours() % 12 || 12}:${String(n.getMinutes()).padStart(2, '0')}`);
    }, 10_000);
    return () => clearInterval(id);
  }, []);
  const ink = dark ? '#FFFFFF' : '#1C1C1E';
  return (
    <div
      className="absolute top-0 left-0 right-0 z-40 pointer-events-none flex items-end justify-between"
      style={{ height: '54px', padding: '0 22px 8px', ...SF }}
    >
      <span style={{ fontSize: '15px', fontWeight: 600, color: ink, letterSpacing: '-0.2px' }}>{time}</span>
      <div className="flex items-center gap-1.5">
        <Signal size={13} style={{ color: ink }} />
        <Wifi size={13} style={{ color: ink }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '24px',
              height: '12px',
              border: `1.5px solid ${ink}`,
              borderRadius: '3px',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div style={{ width: '70%', height: '100%', background: '#34C759', borderRadius: '1px' }} />
          </div>
          <div
            style={{
              position: 'absolute',
              right: '-4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '2.5px',
              height: '5px',
              background: ink,
              borderRadius: '0 1px 1px 0',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function DynamicIsland(): React.JSX.Element {
  return (
    <div
      className="absolute z-50"
      style={{
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '120px',
        height: '34px',
        background: '#000',
        borderRadius: '999px',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04)',
      }}
    />
  );
}

// ─── tab bar ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'careplan', label: 'Care Plan', Icon: ClipboardList },
  { id: 'medication', label: 'Medication', Icon: PillIcon },
  { id: 'devices', label: 'Devices', Icon: Bluetooth },
  { id: 'messages', label: 'Message', Icon: MessageSquare },
] as const;

type TabId = (typeof TABS)[number]['id'];

function BottomTabBar({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }): React.JSX.Element {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-40 flex"
      style={{
        background: 'rgba(249,249,251,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '0.5px solid rgba(0,0,0,0.12)',
        paddingBottom: '22px',
        paddingTop: '8px',
        ...SF,
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const on = active === id;
        const badge = id === 'messages' ? 3 : 0;
        return (
          <button key={id} onClick={() => onChange(id)} className="flex-1 flex flex-col items-center gap-0.5 relative">
            {badge > 0 && (
              <div
                className="absolute flex items-center justify-center"
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#FF3B30',
                  top: '-2px',
                  left: 'calc(50% + 5px)',
                }}
              >
                <span className="text-white font-bold" style={{ fontSize: '8px' }}>
                  {badge}
                </span>
              </div>
            )}
            <Icon
              size={24}
              style={{ color: on ? '#007AFF' : '#8E8E93', strokeWidth: on ? 2.5 : 1.75, transition: 'color 0.15s' }}
            />
            <span
              style={{ fontSize: '9px', fontWeight: 500, color: on ? '#007AFF' : '#8E8E93', transition: 'color 0.15s' }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── screens map ──────────────────────────────────────────────────────────────

const SCREENS: Record<TabId, React.JSX.Element> = {
  dashboard: <DashboardScreen />,
  careplan: <CarePlanScreen />,
  medication: <MedicationScreen />,
  devices: <DevicesScreen />,
  messages: <MessagesScreen />,
};

// ─── main export ──────────────────────────────────────────────────────────────

type AppView = 'signin' | 'otp' | 'app';

export function IPhoneShowcase(): React.JSX.Element {
  const [view, setView] = useState<AppView>('signin');
  const [tab, setTab] = useState<TabId>('dashboard');

  const subheadings: Record<AppView, string> = {
    signin: 'Sign In · Mobile Number',
    otp: 'Sign In · OTP Verification',
    app: 'Patient Portal · iOS 18',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 30% 20%, #0D1B3E 0%, #080D1A 50%, #0A1520 100%)', ...SF }}
    >
      {/* ambient glows */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '10%',
          left: '15%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: '#007AFF',
          opacity: 0.12,
          filter: 'blur(90px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '10%',
          right: '15%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: '#AF52DE',
          opacity: 0.1,
          filter: 'blur(90px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '600px',
          height: '300px',
          borderRadius: '50%',
          background: '#30D158',
          opacity: 0.04,
          filter: 'blur(120px)',
        }}
      />

      <div className="relative flex flex-col items-center" style={{ gap: '24px' }}>
        {/* heading */}
        <div className="text-center">
          <p
            className="font-bold uppercase tracking-widest"
            style={{ fontSize: '11px', color: '#007AFF', letterSpacing: '3px', marginBottom: '6px' }}
          >
            Health Telematix
          </p>
          <h1 className="font-bold text-white" style={{ fontSize: '26px', letterSpacing: '-0.6px', lineHeight: 1.1 }}>
            Mobile Experience
          </h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', transition: 'all 0.3s' }}>
            {subheadings[view]} · iPhone 17 Pro
          </p>
        </div>

        {/* iPhone 17 Pro frame */}
        <div
          className="relative flex-shrink-0"
          style={{
            width: '386px',
            height: '840px',
            borderRadius: '52px',
            background: 'linear-gradient(160deg,#4E4E52 0%,#2C2C2E 35%,#1C1C1E 100%)',
            padding: '11px',
            boxShadow: [
              '0 60px 130px rgba(0,0,0,0.85)',
              '0 20px 50px rgba(0,0,0,0.5)',
              '0 0 0 1px rgba(255,255,255,0.1)',
              '0 0 0 0.5px rgba(0,0,0,0.8)',
              'inset 0 0 0 1px rgba(255,255,255,0.06)',
              'inset 1px 0 0 rgba(255,255,255,0.03)',
            ].join(','),
          }}
        >
          {/* physical buttons */}
          <div
            style={{
              position: 'absolute',
              left: '-3px',
              top: '96px',
              width: '3px',
              height: '28px',
              background: '#3A3A3C',
              borderRadius: '2px 0 0 2px',
              boxShadow: '-1px 0 3px rgba(0,0,0,0.4)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '-3px',
              top: '148px',
              width: '3px',
              height: '58px',
              background: '#3A3A3C',
              borderRadius: '2px 0 0 2px',
              boxShadow: '-1px 0 3px rgba(0,0,0,0.4)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '-3px',
              top: '220px',
              width: '3px',
              height: '58px',
              background: '#3A3A3C',
              borderRadius: '2px 0 0 2px',
              boxShadow: '-1px 0 3px rgba(0,0,0,0.4)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: '-3px',
              top: '170px',
              width: '3px',
              height: '84px',
              background: '#3A3A3C',
              borderRadius: '0 2px 2px 0',
              boxShadow: '1px 0 3px rgba(0,0,0,0.4)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '5px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '42px',
              height: '4px',
              background: '#2A2A2C',
              borderRadius: '2px',
            }}
          />

          {/* screen */}
          <div
            className="relative overflow-hidden w-full h-full"
            style={{ borderRadius: '42px', background: '#F2F2F7' }}
          >
            <DynamicIsland />
            <StatusBar />

            {/* auth flow */}
            {view !== 'app' && (
              <div
                key={view}
                className="absolute"
                style={{ top: '54px', left: 0, right: 0, bottom: 0, animation: 'htx-fade 0.22s ease-out' }}
              >
                {view === 'signin' && <SignInScreen onContinue={() => setView('otp')} />}
                {view === 'otp' && (
                  <OtpScreen
                    onVerify={() => {
                      setTab('dashboard');
                      setView('app');
                    }}
                    onBack={() => setView('signin')}
                  />
                )}
              </div>
            )}

            {/* main app */}
            {view === 'app' && (
              <>
                <div
                  className="absolute"
                  style={{ top: '54px', left: 0, right: 0, bottom: '83px', overflow: 'hidden' }}
                >
                  <div key={tab} className="w-full h-full" style={{ animation: 'htx-fade 0.18s ease-out' }}>
                    {SCREENS[tab]}
                  </div>
                </div>
                <BottomTabBar active={tab} onChange={setTab} />
              </>
            )}
          </div>
        </div>

        {/* caption */}
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
          {view === 'app'
            ? 'Tap the tabs to explore · Health Telematix Patient Portal'
            : 'Tap Continue to walk through the sign-in flow'}
        </p>
      </div>

      <style>{`
        @keyframes htx-fade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes htx-pop {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
