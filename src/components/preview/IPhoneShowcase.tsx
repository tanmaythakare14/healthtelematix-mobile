import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Heart,
  Activity,
  Plus,
  AlertCircle,
  ArrowRight,
  Wifi,
  Signal,
  Shield,
  ChevronDown,
  BarChart3,
  CheckCircle2,
  Loader2,
  LayoutDashboard,
  ClipboardList,
  Pill as PillIcon,
  Bluetooth,
  RefreshCw,
  Droplets,
  Scale,
  Zap,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';

// ─── brand ────────────────────────────────────────────────────────────────────

const P = '#1A2D45'; // primary

// ─── mock data ────────────────────────────────────────────────────────────────

// ─── shared primitives ────────────────────────────────────────────────────────

const SF: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
};

// ─── sign in screen ───────────────────────────────────────────────────────────

function SignInScreen({ onContinue }: { onContinue: () => void }): React.JSX.Element {
  const [pressed, setPressed] = useState(false);
  const handleContinue = () => {
    setPressed(true);
    setTimeout(onContinue, 150);
  };

  return (
    <div
      style={{
        ...SF,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(160deg,#1A3A5C 0%,#1A2D45 50%,#0F1E30 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── decorative circles in header ── */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '-30px',
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }}
      />

      {/* ── header ── */}
      <div style={{ padding: '22px 24px 36px', flexShrink: 0 }}>
        {/* logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '11px',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Heart size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              letterSpacing: '-0.1px',
            }}
          >
            Health Telematix
          </p>
        </div>
        {/* title */}
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.6px',
            lineHeight: 1.15,
            margin: '0 0 6px',
          }}
        >
          Sign In
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>Welcome back to your portal</p>
      </div>

      {/* ── white card slides up ── */}
      <div
        style={{
          flex: 1,
          background: '#fff',
          borderRadius: '28px 28px 0 0',
          padding: '28px 24px 20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* welcome text */}
        <div style={{ marginBottom: '22px' }}>
          <h2
            style={{ fontSize: '20px', fontWeight: 800, color: '#1C1C1E', letterSpacing: '-0.4px', margin: '0 0 4px' }}
          >
            Welcome Back! 👋
          </h2>
          <p style={{ fontSize: '12.5px', color: '#8E8E93', margin: 0, lineHeight: 1.5 }}>
            Enter your mobile number to sign in
          </p>
        </div>

        {/* mobile number label */}
        <p
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#8E8E93',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            margin: '0 0 7px',
          }}
        >
          Mobile Number
        </p>

        {/* phone input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: '13px',
            background: '#F7F8FA',
            border: '1.5px solid #EBEBEB',
            height: '50px',
            overflow: 'hidden',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0 13px',
              height: '100%',
              borderRight: '1.5px solid #EBEBEB',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '15px', lineHeight: 1 }}>🇺🇸</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C1C1E' }}>+1</span>
            <ChevronDown size={10} color="#8E8E93" />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 13px', gap: '2px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#1C1C1E' }}>(555) 234‑5678</span>
            <div
              style={{
                width: '1.5px',
                height: '17px',
                background: P,
                borderRadius: '1px',
                animation: 'htx-blink 1s step-end infinite',
              }}
            />
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleContinue}
          style={{
            width: '100%',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '13px',
            background: `linear-gradient(135deg,#1A3A5C 0%,${P} 100%)`,
            boxShadow: `0 8px 20px rgba(26,45,69,0.28)`,
            border: 'none',
            cursor: 'pointer',
            transform: pressed ? 'scale(0.97)' : 'scale(1)',
            transition: 'transform 0.12s',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>Continue</span>
          <ArrowRight size={15} color="#fff" strokeWidth={2.5} />
        </button>

        {/* footer */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <Shield size={9} color="#C7C7CC" />
          <p style={{ fontSize: '10px', color: '#C7C7CC', margin: 0 }}>HIPAA compliant · End-to-end encrypted</p>
        </div>
      </div>
    </div>
  );
}

// ─── otp screen ───────────────────────────────────────────────────────────────

const OTP_CODE = ['4', '2', '7', '8'];

function OtpScreen({ onVerify, onBack }: { onVerify: () => void; onBack: () => void }): React.JSX.Element {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const filled = digits.filter(Boolean).length;
  const allFilled = filled === 4;

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
    <div
      style={{
        ...SF,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(160deg,#1A3A5C 0%,#1A2D45 50%,#0F1E30 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '-30px',
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }}
      />

      {/* ── header ── */}
      <div style={{ padding: '18px 24px 36px', flexShrink: 0 }}>
        {/* back button */}
        <button
          onClick={onBack}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '11px',
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <ChevronLeft size={18} color="#fff" strokeWidth={2.5} />
        </button>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.6px',
            lineHeight: 1.15,
            margin: '0 0 6px',
          }}
        >
          Verify your number
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
          A 4-digit verification code was sent via SMS to your registered mobile number
        </p>
      </div>

      {/* ── white card ── */}
      <div
        style={{
          flex: 1,
          background: '#fff',
          borderRadius: '28px 28px 0 0',
          padding: '28px 24px 20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* sent-to label */}
        <div style={{ marginBottom: '24px' }}>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#8E8E93',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
              margin: '0 0 4px',
            }}
          >
            Verification code delivered to
          </p>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1E', margin: 0 }}>
            +1 (555) 234‑5678 &nbsp;
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#8E8E93' }}>· SMS · United States</span>
          </p>
        </div>

        {/* OTP boxes */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {digits.map((d, i) => {
            const isActive = i === filled && !allFilled;
            const isFilled = d !== '';
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '14px',
                  background: '#F2F4F7',
                  border: `2px solid ${isActive ? P : isFilled ? `${P}30` : 'transparent'}`,
                  boxShadow: isActive ? `0 0 0 3px ${P}15` : 'none',
                  transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: isFilled ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {isFilled ? (
                  <span
                    style={{
                      fontSize: '26px',
                      fontWeight: 800,
                      color: P,
                      animation: 'htx-pop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                    }}
                  >
                    {d}
                  </span>
                ) : isActive ? (
                  <div
                    style={{
                      width: '2px',
                      height: '26px',
                      background: P,
                      borderRadius: '1px',
                      animation: 'htx-blink 1s step-end infinite',
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* resend row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
          <p style={{ fontSize: '12px', color: '#8E8E93', margin: 0 }}>Didn't receive a code?</p>
          {countdown > 0 ? (
            <p style={{ fontSize: '12px', color: '#8E8E93', margin: 0 }}>
              Resend in <span style={{ color: P, fontWeight: 600 }}>0:{String(countdown).padStart(2, '0')}</span>
            </p>
          ) : (
            <button
              onClick={() => setCountdown(30)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <span style={{ fontSize: '12px', color: P, fontWeight: 600 }}>Resend now</span>
            </button>
          )}
        </div>

        {/* verify CTA */}
        <button
          onClick={handleVerify}
          style={{
            width: '100%',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '13px',
            background: allFilled ? 'linear-gradient(135deg,#1A3A5C,#1A2D45)' : '#F2F2F7',
            boxShadow: allFilled ? '0 8px 20px rgba(26,45,69,0.28)' : 'none',
            border: 'none',
            cursor: allFilled ? 'pointer' : 'default',
            transition: 'all 0.25s',
            marginBottom: '14px',
          }}
        >
          {verifying && !verified ? (
            <>
              <Loader2 size={17} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Verifying…</span>
            </>
          ) : verified ? (
            <>
              <CheckCircle2 size={17} color="#fff" />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Verified!</span>
            </>
          ) : (
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: allFilled ? '#fff' : '#C7C7CC',
                letterSpacing: '-0.2px',
              }}
            >
              Verify &amp; Sign In
            </span>
          )}
        </button>

        {/* auto-fill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '13px',
            background: '#F7F8FA',
            marginBottom: 'auto',
          }}
        >
          <span style={{ fontSize: '16px', lineHeight: 1 }}>📲</span>
          <p style={{ fontSize: '12px', color: '#8E8E93', margin: 0 }}>Auto-fill from Messages</p>
        </div>

        {/* footer */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <Shield size={9} color="#C7C7CC" />
          <p style={{ fontSize: '10px', color: '#C7C7CC', margin: 0 }}>Secure one-time password · HIPAA compliant</p>
        </div>
      </div>
    </div>
  );
}

// ─── dashboard screen ─────────────────────────────────────────────────────────

function ComingSoonScreen({ title, onLogout }: { title: string; onLogout?: () => void }): React.JSX.Element {
  return (
    <div style={{ ...SF, height: '100%', display: 'flex', flexDirection: 'column', background: '#F2F2F7' }}>
      <div
        style={{
          background: '#fff',
          padding: '16px 20px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.4px', margin: 0 }}>
          {title}
        </h1>
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#FFF0F0',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={16} style={{ color: '#FF3B30' }} />
          </button>
        )}
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: `${P}12`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
          }}
        >
          <Zap size={28} style={{ color: P }} />
        </div>
        <p
          style={{ fontSize: '20px', fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.3px', marginBottom: '8px' }}
        >
          Coming Soon
        </p>
        <p style={{ fontSize: '13px', color: '#8E8E93', lineHeight: 1.5, margin: 0 }}>
          This section is under development and will be available in a future update.
        </p>
      </div>
    </div>
  );
}

function DashboardScreen({ onLogout }: { onLogout?: () => void }): React.JSX.Element {
  return <ComingSoonScreen title="Dashboard" onLogout={onLogout} />;
}

// ─── care plan screen ─────────────────────────────────────────────────────────

// ─── care plan data ───────────────────────────────────────────────────────────

const CP_PLANS = [
  {
    id: '1',
    status: 'active',
    name: 'Hypertension Management Care Plan',
    condition: 'Hypertension',
    condColor: '#FF3B30',
    condBg: '#FF3B3015',
    program: 'RPM',
    progColor: '#007AFF',
    progBg: '#007AFF12',
    description: 'BP monitoring and medication adherence with bi-weekly nurse touchpoints and daily BP cuff readings.',
    progress: 68,
    date: 'Updated May 18, 2026',
    assignedBy: 'Dr. Marcus Reid',
    device: 'Blood Pressure Cuff',
  },
  {
    id: '2',
    status: 'active',
    name: 'Type 2 Diabetes Glucose Control Plan',
    condition: 'Diabetes',
    condColor: '#FF9500',
    condBg: '#FF950015',
    program: 'APCM',
    progColor: '#AF52DE',
    progBg: '#AF52DE12',
    description: 'Continuous glucose monitoring with CGM device and monthly HbA1c target reviews.',
    progress: 45,
    date: 'Updated May 20, 2026',
    assignedBy: 'Dr. Sarah Kim',
    device: 'CGM — Dexcom G7',
  },
  {
    id: '3',
    status: 'active',
    name: 'Heart Failure Weight & Fluid Management',
    condition: 'Heart Failure',
    condColor: '#007AFF',
    condBg: '#007AFF12',
    program: 'RPM',
    progColor: '#007AFF',
    progBg: '#007AFF12',
    description: 'Daily weight monitoring and escalation protocol for weight gain exceeding 2 lbs per day.',
    progress: 32,
    date: 'Updated May 21, 2026',
    assignedBy: 'Dr. Michael Torres',
    device: 'Weight Scale',
  },
  {
    id: '4',
    status: 'completed',
    name: 'Obesity Reduction & Lifestyle Plan',
    condition: 'Obesity',
    condColor: '#34C759',
    condBg: '#34C75912',
    program: 'APCM',
    progColor: '#AF52DE',
    progBg: '#AF52DE12',
    description: 'Structured 12-month weight reduction targeting 5% body weight loss through dietary changes.',
    progress: 100,
    date: 'Completed Jan 10, 2026',
    assignedBy: 'Dr. Marcus Reid',
    device: 'Weight Scale',
  },
  {
    id: '5',
    status: 'completed',
    name: 'Initial Hypertension Stabilisation Plan',
    condition: 'Hypertension',
    condColor: '#FF3B30',
    condBg: '#FF3B3015',
    program: 'RPM',
    progColor: '#007AFF',
    progBg: '#007AFF12',
    description: 'First-phase plan to reduce systolic BP below 140 mmHg via Lisinopril titration.',
    progress: 100,
    date: 'Completed Apr 10, 2025',
    assignedBy: 'Dr. Sarah Kim',
    device: 'Blood Pressure Cuff',
  },
] as const;

// ─── detail data (keyed by plan id) ──────────────────────────────────────────

const CP_DETAIL: Record<
  string,
  {
    fullDescription: string;
    touchpoint: string;
    device: string;
    startDate: string;
    endDate: string;
    goals: { name: string; current: string; target: string; progress: number; condition: string; condColor: string }[];
    activities: {
      name: string;
      category: string;
      catColor: string;
      catBg: string;
      frequency: string;
      status: string;
    }[];
    medications: {
      drug: string;
      dosage: string;
      pills: string;
      mealTime: string;
      startDate: string;
      endDate: string;
      frequency: string;
      prescribedBy: string;
      status: 'Active' | 'Inactive';
      linkedPlan: string;
    }[];
    program: { type: string; dateEnrolled: string; status: 'Active' | 'Inactive'; progColor: string; progBg: string };
    clinicalNotes: string;
  }
> = {
  '1': {
    fullDescription:
      'A comprehensive care plan addressing Hypertension through remote patient monitoring, medication adherence, lifestyle interventions, and regular clinical touchpoints via Blood Pressure Cuff device.',
    touchpoint: 'Bi-weekly',
    device: 'Blood Pressure Cuff',
    startDate: 'Jan 10, 2024',
    endDate: 'Jan 10, 2025',
    goals: [
      {
        name: 'Blood Pressure Control',
        current: '128/82 mmHg',
        target: '< 130/80 mmHg',
        progress: 68,
        condition: 'Hypertension',
        condColor: '#FF3B30',
      },
      {
        name: 'Reduce Resting Heart Rate',
        current: '88 bpm',
        target: '< 80 bpm',
        progress: 38,
        condition: 'Hypertension',
        condColor: '#FF3B30',
      },
    ],
    activities: [
      {
        name: 'Twice-Daily BP Readings',
        category: 'Monitoring',
        catColor: '#007AFF',
        catBg: '#007AFF12',
        frequency: 'Twice Daily (7 AM & 7 PM)',
        status: 'Active',
      },
      {
        name: 'Structured Aerobic Exercise',
        category: 'Lifestyle',
        catColor: '#34C759',
        catBg: '#34C75912',
        frequency: 'Weekly Tracking',
        status: 'Active',
      },
      {
        name: 'Lisinopril Titration Review',
        category: 'Medication',
        catColor: '#AF52DE',
        catBg: '#AF52DE12',
        frequency: 'Weekly Reviews',
        status: 'Completed',
      },
    ],
    medications: [
      {
        drug: 'Lisinopril',
        dosage: '10 mg',
        pills: '1 pill',
        mealTime: 'Before Meal',
        startDate: 'Jan 10, 2024',
        endDate: 'Ongoing',
        frequency: 'Once Daily',
        prescribedBy: 'Dr. Marcus Reid',
        status: 'Active',
        linkedPlan: 'Hypertension Management Care Plan',
      },
      {
        drug: 'Atorvastatin',
        dosage: '20 mg',
        pills: '1 pill',
        mealTime: 'After Meal',
        startDate: 'Mar 01, 2024',
        endDate: 'Ongoing',
        frequency: 'Once Daily',
        prescribedBy: 'Dr. Sarah Kim',
        status: 'Active',
        linkedPlan: 'Hypertension Management Care Plan',
      },
    ],
    program: { type: 'RPM', dateEnrolled: 'Jan 10, 2024', status: 'Active', progColor: '#007AFF', progBg: '#007AFF12' },
    clinicalNotes:
      'Patient shows strong motivation and good family support — reinforce positive behavior at every clinical touchpoint. RPM compliance is strongest for BP Cuff morning readings (82%); medication self-report (78%) and resting HR target need continued improvement.',
  },
  '2': {
    fullDescription:
      'Continuous glucose monitoring plan using CGM device with daily fasting and post-meal logging, weekly nurse review of CGM trends, and monthly HbA1c assessments.',
    touchpoint: 'Weekly',
    device: 'CGM — Dexcom G7',
    startDate: 'Feb 05, 2024',
    endDate: 'Feb 05, 2025',
    goals: [
      {
        name: 'Fasting Blood Glucose',
        current: '118 mg/dL',
        target: '70–130 mg/dL',
        progress: 72,
        condition: 'Diabetes',
        condColor: '#FF9500',
      },
      {
        name: 'CGM Reading Compliance',
        current: '78%',
        target: '≥ 95%',
        progress: 45,
        condition: 'Diabetes',
        condColor: '#FF9500',
      },
    ],
    activities: [
      {
        name: 'Daily CGM Glucose Logging',
        category: 'Monitoring',
        catColor: '#007AFF',
        catBg: '#007AFF12',
        frequency: '4× Daily',
        status: 'Active',
      },
      {
        name: 'Weekly Nurse CGM Review',
        category: 'Follow-up',
        catColor: '#FF9500',
        catBg: '#FF950012',
        frequency: 'Once Weekly',
        status: 'Active',
      },
    ],
    medications: [
      {
        drug: 'Empagliflozin',
        dosage: '10 mg',
        pills: '1 pill',
        mealTime: 'No Restriction',
        startDate: 'Mar 20, 2024',
        endDate: 'Ongoing',
        frequency: 'Once Daily',
        prescribedBy: 'Dr. Sarah Kim',
        status: 'Active',
        linkedPlan: 'Type 2 Diabetes Glucose Control Plan',
      },
      {
        drug: 'Metformin',
        dosage: '500 mg',
        pills: '2 pills',
        mealTime: 'With Meal',
        startDate: 'Feb 05, 2024',
        endDate: 'Ongoing',
        frequency: 'Twice Daily',
        prescribedBy: 'Dr. Sarah Kim',
        status: 'Active',
        linkedPlan: 'Type 2 Diabetes Glucose Control Plan',
      },
    ],
    program: {
      type: 'APCM',
      dateEnrolled: 'Feb 05, 2024',
      status: 'Active',
      progColor: '#AF52DE',
      progBg: '#AF52DE12',
    },
    clinicalNotes:
      'Patient demonstrates good CGM wear-time but fasting readings remain above target range. Encourage consistent sensor placement and review carbohydrate intake log at next touchpoint. Metformin tolerance confirmed; no GI complaints reported.',
  },
  '3': {
    fullDescription:
      'Heart failure management through daily smart-scale weight monitoring, sodium and fluid intake restriction, and automated escalation protocol if weight gain exceeds 2 lbs per day.',
    touchpoint: 'Bi-weekly',
    device: 'Weight Scale',
    startDate: 'Feb 01, 2024',
    endDate: 'Feb 01, 2025',
    goals: [
      {
        name: 'Body Weight Reduction 5%',
        current: '184 lbs',
        target: '≤ 174 lbs',
        progress: 45,
        condition: 'Heart Failure',
        condColor: '#007AFF',
      },
      {
        name: 'Daily Weight Compliance',
        current: '91%',
        target: '≥ 95%',
        progress: 32,
        condition: 'Heart Failure',
        condColor: '#007AFF',
      },
    ],
    activities: [
      {
        name: 'Morning Weight Check',
        category: 'Monitoring',
        catColor: '#007AFF',
        catBg: '#007AFF12',
        frequency: 'Once Daily (Morning)',
        status: 'Active',
      },
      {
        name: 'Sodium Intake Logging',
        category: 'Lifestyle',
        catColor: '#34C759',
        catBg: '#34C75912',
        frequency: 'Daily',
        status: 'Active',
      },
    ],
    medications: [
      {
        drug: 'Furosemide',
        dosage: '40 mg',
        pills: '1 pill',
        mealTime: 'Before Meal',
        startDate: 'Feb 01, 2024',
        endDate: 'Ongoing',
        frequency: 'Once Daily',
        prescribedBy: 'Dr. Michael Torres',
        status: 'Active',
        linkedPlan: 'Heart Failure Weight & Fluid Management',
      },
    ],
    program: { type: 'RPM', dateEnrolled: 'Feb 01, 2024', status: 'Active', progColor: '#007AFF', progBg: '#007AFF12' },
    clinicalNotes:
      'Weight trending down consistently over past 6 weeks — patient is highly adherent to sodium restriction. Monitor for fluid retention signs at next bi-weekly check. Consider reducing Furosemide if weight stabilises below 185 lbs for 2+ consecutive weeks.',
  },
  '4': {
    fullDescription:
      'Completed 12-month structured weight reduction program. Patient achieved 5.3% body weight reduction through dietary coaching and supervised aerobic exercise program.',
    touchpoint: 'Monthly',
    device: 'Weight Scale',
    startDate: 'Jan 10, 2025',
    endDate: 'Jan 10, 2026',
    goals: [
      {
        name: 'Weight Loss 5% Target',
        current: '172 lbs',
        target: '≤ 174 lbs',
        progress: 100,
        condition: 'Obesity',
        condColor: '#34C759',
      },
    ],
    activities: [
      {
        name: 'Weekly Weigh-In & Log',
        category: 'Monitoring',
        catColor: '#007AFF',
        catBg: '#007AFF12',
        frequency: 'Once Weekly',
        status: 'Completed',
      },
      {
        name: 'Dietary Coaching Session',
        category: 'Education',
        catColor: '#FF9500',
        catBg: '#FF950012',
        frequency: 'Monthly',
        status: 'Completed',
      },
    ],
    medications: [
      {
        drug: 'Orlistat',
        dosage: '120 mg',
        pills: '1 pill',
        mealTime: 'With Meal',
        startDate: 'Jan 10, 2025',
        endDate: 'Jan 10, 2026',
        frequency: 'Three Times Daily',
        prescribedBy: 'Dr. Marcus Reid',
        status: 'Inactive',
        linkedPlan: 'Obesity Reduction & Lifestyle Plan',
      },
    ],
    program: {
      type: 'APCM',
      dateEnrolled: 'Jan 10, 2025',
      status: 'Inactive',
      progColor: '#8E8E93',
      progBg: '#8E8E9312',
    },
    clinicalNotes:
      'Patient successfully completed 12-month weight reduction program, achieving 5.3% body weight loss. All monitoring activities marked complete. Recommend transitioning to maintenance dietary plan and scheduling a 3-month follow-up to assess weight stability.',
  },
  '5': {
    fullDescription:
      'Completed first-phase plan targeting systolic BP reduction below 140 mmHg through Lisinopril titration and sodium-restricted dietary guidance. Goal achieved at 3-month review.',
    touchpoint: 'Weekly',
    device: 'Blood Pressure Cuff',
    startDate: 'Jan 10, 2024',
    endDate: 'Apr 10, 2024',
    goals: [
      {
        name: 'Systolic BP Below 140 mmHg',
        current: '136 mmHg',
        target: '< 140 mmHg',
        progress: 100,
        condition: 'Hypertension',
        condColor: '#FF3B30',
      },
    ],
    activities: [
      {
        name: 'Daily BP Cuff Readings',
        category: 'Monitoring',
        catColor: '#007AFF',
        catBg: '#007AFF12',
        frequency: 'Twice Daily',
        status: 'Completed',
      },
      {
        name: 'Lisinopril Titration Review',
        category: 'Medication',
        catColor: '#AF52DE',
        catBg: '#AF52DE12',
        frequency: 'Weekly Reviews',
        status: 'Completed',
      },
    ],
    medications: [
      {
        drug: 'Lisinopril',
        dosage: '5 mg → 10 mg',
        pills: '1 pill',
        mealTime: 'Before Meal',
        startDate: 'Jan 10, 2024',
        endDate: 'Apr 10, 2024',
        frequency: 'Once Daily',
        prescribedBy: 'Dr. Sarah Kim',
        status: 'Inactive',
        linkedPlan: 'Initial Hypertension Stabilisation Plan',
      },
    ],
    program: {
      type: 'RPM',
      dateEnrolled: 'Jan 10, 2024',
      status: 'Inactive',
      progColor: '#8E8E93',
      progBg: '#8E8E9312',
    },
    clinicalNotes:
      'Goal achieved at the 3-month review checkpoint. Systolic BP stabilised below 140 mmHg following Lisinopril titration from 5 mg to 10 mg. Patient adherence to low-sodium diet was commendable. Plan closed; patient transitioned to the ongoing Hypertension Management Care Plan.',
  },
};

// ─── care plan detail screen ──────────────────────────────────────────────────

function CarePlanDetailScreen({ planId, onBack }: { planId: string; onBack: () => void }): React.JSX.Element {
  const plan = CP_PLANS.find((p) => p.id === planId)!;
  const detail = CP_DETAIL[planId];
  const isCompleted = plan.status === 'completed';

  const progColor = (pct: number) => (pct >= 75 ? '#34C759' : pct >= 40 ? '#FF9500' : '#FF3B30');

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p
      style={{
        fontSize: '9.5px',
        fontWeight: 700,
        color: '#8E8E93',
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        marginBottom: '8px',
      }}
    >
      {children}
    </p>
  );

  const FieldRow = ({ label, value }: { label: string; value: string }) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '8px 0',
        borderBottom: '1px solid #F2F2F7',
      }}
    >
      <span style={{ fontSize: '12px', color: '#8E8E93' }}>{label}</span>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C1C1E', textAlign: 'right', maxWidth: '55%' }}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="h-full flex flex-col" style={{ ...SF, background: '#F2F2F7' }}>
      {/* nav bar */}
      <div className="bg-white flex items-center gap-3 px-4 pt-3 pb-3" style={{ borderBottom: '1px solid #F2F2F7' }}>
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: '#F2F2F7' }}
        >
          <ChevronLeft size={17} style={{ color: '#1C1C1E' }} strokeWidth={2.5} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold leading-tight truncate" style={{ color: '#1C1C1E' }}>
            {plan.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: plan.condColor,
                background: plan.condBg,
                borderRadius: '999px',
                padding: '1px 7px',
              }}
            >
              {plan.condition}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: isCompleted ? '#8E8E93' : '#34C759',
                background: isCompleted ? '#F2F2F7' : '#34C75912',
                borderRadius: '999px',
                padding: '1px 7px',
              }}
            >
              {isCompleted ? 'Completed' : '● Active'}
            </span>
          </div>
        </div>
      </div>

      {/* scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: 'none' }}>
        {/* ── Overview ── */}
        <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #F2F2F7' }}>
            <SectionLabel>Care Plan Overview</SectionLabel>
            <p style={{ fontSize: '11.5px', color: '#3C3C3E', lineHeight: 1.55 }}>{detail.fullDescription}</p>
          </div>
          <div className="px-4 pb-1">
            <FieldRow label="Touchpoint Frequency" value={detail.touchpoint} />
            <FieldRow label="Linked Device" value={detail.device} />
            <FieldRow label="Start Date" value={detail.startDate} />
            <FieldRow label="End Date" value={detail.endDate} />
          </div>
        </div>

        {/* ── Goals (with nested Activity + Medication) ── */}
        <div>
          <SectionLabel>Goals</SectionLabel>
          <div className="space-y-3">
            {detail.goals.map((g, i) => {
              const activity = detail.activities[i];
              const medication = detail.medications[i];
              return (
                <div
                  key={i}
                  style={{
                    borderRadius: '16px',
                    background: '#fff',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                  }}
                >
                  {/* ── goal header ── */}
                  <div style={{ padding: '12px 14px 12px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: '#1C1C1E',
                          flex: 1,
                          marginRight: '8px',
                          lineHeight: 1.3,
                        }}
                      >
                        {g.name}
                      </p>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: g.condColor,
                          background: `${g.condColor}15`,
                          borderRadius: '999px',
                          padding: '2px 7px',
                          flexShrink: 0,
                        }}
                      >
                        {g.condition}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontSize: '10.5px', color: '#8E8E93' }}>Current:</span>
                      <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#1C1C1E' }}>{g.current}</span>
                      <span style={{ fontSize: '10px', color: '#C7C7CC' }}>·</span>
                      <span style={{ fontSize: '10.5px', color: '#8E8E93' }}>Target:</span>
                      <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#34C759' }}>{g.target}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          flex: 1,
                          height: '6px',
                          background: '#F2F2F7',
                          borderRadius: '999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${g.progress}%`,
                            height: '100%',
                            background: progColor(g.progress),
                            borderRadius: '999px',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: progColor(g.progress),
                          minWidth: '28px',
                          textAlign: 'right',
                        }}
                      >
                        {g.progress}%
                      </span>
                    </div>
                  </div>

                  {/* ── related activity ── */}
                  {activity && (
                    <div style={{ background: '#FAFAFA', borderTop: '1px solid #F0F0F0', padding: '10px 14px' }}>
                      <p
                        style={{
                          fontSize: '8.5px',
                          fontWeight: 700,
                          color: '#8E8E93',
                          letterSpacing: '0.6px',
                          textTransform: 'uppercase',
                          marginBottom: '7px',
                        }}
                      >
                        Activity
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '9px',
                              background: activity.catBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Activity size={13} style={{ color: activity.catColor }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '11.5px', fontWeight: 600, color: '#1C1C1E', lineHeight: 1.3 }}>
                              {activity.name}
                            </p>
                            <p style={{ fontSize: '10px', color: '#8E8E93', marginTop: '1px' }}>{activity.frequency}</p>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            color: activity.catColor,
                            background: activity.catBg,
                            borderRadius: '999px',
                            padding: '2px 7px',
                            flexShrink: 0,
                            marginLeft: '8px',
                          }}
                        >
                          {activity.category}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ── related medication ── */}
                  {medication && (
                    <div style={{ background: '#FAFAFA', borderTop: '1px solid #F0F0F0', padding: '10px 14px' }}>
                      <p
                        style={{
                          fontSize: '8.5px',
                          fontWeight: 700,
                          color: '#8E8E93',
                          letterSpacing: '0.6px',
                          textTransform: 'uppercase',
                          marginBottom: '7px',
                        }}
                      >
                        Medication
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '9px',
                              background: '#AF52DE12',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <PillIcon size={13} style={{ color: '#AF52DE' }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '11.5px', fontWeight: 600, color: '#1C1C1E', lineHeight: 1.3 }}>
                              {medication.drug} · {medication.dosage}
                            </p>
                            <p style={{ fontSize: '10px', color: '#8E8E93', marginTop: '1px' }}>
                              {medication.frequency} · {medication.mealTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Clinical Notes ── */}
        <div>
          <SectionLabel>Clinical Notes</SectionLabel>
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #E5E5EA',
              padding: '12px 14px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <p style={{ fontSize: '12px', color: '#3C3C3E', lineHeight: 1.65 }}>{detail.clinicalNotes}</p>
          </div>
        </div>

        {/* ── Program Enrolled ── */}
        <div className="pb-4">
          <SectionLabel>Program Enrolled</SectionLabel>
          <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div
              className="px-4 pt-3 pb-2.5 flex items-center justify-between"
              style={{ borderBottom: '1px solid #F2F2F7' }}
            >
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '9px',
                    background: detail.program.progBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BarChart3 size={14} style={{ color: detail.program.progColor }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: detail.program.progColor }}>
                  {detail.program.type}
                </p>
              </div>
            </div>
            <div className="px-4 pb-1">
              <FieldRow label="Date of Enrollment" value={detail.program.dateEnrolled} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── care plan list screen ────────────────────────────────────────────────────

function CarePlanScreen(): React.JSX.Element {
  const [cpTab, setCpTab] = useState<'active' | 'completed'>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const visible = CP_PLANS.filter((p) => p.status === cpTab);
  const progBarColor = (pct: number) => (pct >= 75 ? '#34C759' : pct >= 40 ? '#FF9500' : '#FF3B30');

  if (selectedId) {
    return <CarePlanDetailScreen planId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="h-full flex flex-col" style={{ ...SF, background: '#F2F2F7' }}>
      {/* header */}
      <div className="bg-white px-5 pt-4 pb-3">
        <h1 className="text-[20px] font-bold mb-3" style={{ color: '#1C1C1E', letterSpacing: '-0.4px' }}>
          Care Plans
        </h1>
        <div className="flex items-center p-1 rounded-xl" style={{ background: '#F2F2F7', gap: '4px' }}>
          {(['active', 'completed'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setCpTab(t)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5"
              style={{
                background: cpTab === t ? '#fff' : 'transparent',
                boxShadow: cpTab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <span
                style={{ fontSize: '12px', fontWeight: cpTab === t ? 700 : 500, color: cpTab === t ? P : '#8E8E93' }}
              >
                {t === 'active' ? 'Active' : 'Completed'}
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: cpTab === t ? P : '#8E8E93',
                  background: cpTab === t ? `${P}14` : '#E5E5EA',
                  borderRadius: '999px',
                  padding: '1px 5px',
                }}
              >
                {CP_PLANS.filter((p) => p.status === t).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* cards */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3"
        style={{ scrollbarWidth: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        {visible.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedId(plan.id)}
            className="text-left w-full"
            style={{
              display: 'block',
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <div className="flex items-start gap-3 px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #F2F2F7' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `${P}14`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ClipboardList size={16} style={{ color: P }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold leading-snug mb-1.5" style={{ color: '#1C1C1E' }}>
                  {plan.name}
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: plan.condColor,
                      background: plan.condBg,
                      borderRadius: '999px',
                      padding: '2px 7px',
                    }}
                  >
                    {plan.condition}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: plan.progColor,
                      background: plan.progBg,
                      borderRadius: '999px',
                      padding: '2px 7px',
                    }}
                  >
                    {plan.program}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
                  <Bluetooth size={10} style={{ color: '#8E8E93', flexShrink: 0 }} />
                  <span style={{ fontSize: '10.5px', color: '#8E8E93', fontWeight: 500 }}>{plan.device}</span>
                </div>
              </div>
              <ArrowRight size={14} style={{ color: '#C7C7CC', flexShrink: 0, marginTop: '2px' }} />
            </div>
            <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #F2F2F7' }}>
              <p style={{ fontSize: '11px', color: '#8E8E93', lineHeight: 1.5 }}>{plan.description}</p>
            </div>
            <div className="px-4 pt-3 pb-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <p
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#C7C7CC',
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase',
                  }}
                >
                  Progress
                </p>
                <span style={{ fontSize: '11px', fontWeight: 700, color: progBarColor(plan.progress) }}>
                  {plan.progress}%
                </span>
              </div>
              <div style={{ height: '8px', background: '#F2F2F7', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${plan.progress}%`,
                    height: '100%',
                    borderRadius: '999px',
                    background: progBarColor(plan.progress),
                  }}
                />
              </div>
              <p style={{ fontSize: '10px', color: '#C7C7CC', marginTop: '7px' }}>
                {plan.date} · {plan.assignedBy}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── messages screen ──────────────────────────────────────────────────────────

// ─── medication screen ────────────────────────────────────────────────────────

const MED_DATA = [
  {
    id: 'm1',
    status: 'active',
    drug: 'Metformin',
    dosage: '500 mg',
    form: 'Tablet',
    condition: 'Diabetes',
    condColor: '#FF9500',
    condBg: '#FF950015',
    frequency: 'Twice Daily',
    mealTime: 'After Meal',
    startDate: 'Jan 10, 2024',
    endDate: 'Ongoing',
    addedBy: 'EHR',
    linkedPlan: 'Type 2 Diabetes Glucose Control Plan',
    clinicalInstruction: 'Take with food to reduce GI discomfort. Do not crush or chew tablets.',
    prescribedBy: 'Dr. Sarah Kim',
    specialty: 'Internal Medicine',
  },
  {
    id: 'm2',
    status: 'active',
    drug: 'Lisinopril',
    dosage: '10 mg',
    form: 'Tablet',
    condition: 'Hypertension',
    condColor: '#FF3B30',
    condBg: '#FF3B3015',
    frequency: 'Once Daily',
    mealTime: 'Before Meal',
    startDate: 'Jan 10, 2024',
    endDate: 'Ongoing',
    addedBy: 'Doctor',
    linkedPlan: 'Hypertension Management Care Plan',
    clinicalInstruction: 'Monitor BP regularly. Avoid potassium supplements unless directed.',
    prescribedBy: 'Dr. Marcus Reid',
    specialty: 'Cardiology',
  },
  {
    id: 'm3',
    status: 'active',
    drug: 'Empagliflozin',
    dosage: '10 mg',
    form: 'Tablet',
    condition: 'Diabetes',
    condColor: '#FF9500',
    condBg: '#FF950015',
    frequency: 'Once Daily',
    mealTime: 'No Restriction',
    startDate: 'Mar 20, 2024',
    endDate: 'Ongoing',
    addedBy: 'Doctor',
    linkedPlan: 'Type 2 Diabetes Glucose Control Plan',
    clinicalInstruction: 'Stay well hydrated. Discontinue if urinary tract infection develops.',
    prescribedBy: 'Dr. Sarah Kim',
    specialty: 'Endocrinology',
  },
  {
    id: 'm4',
    status: 'active',
    drug: 'Atorvastatin',
    dosage: '20 mg',
    form: 'Tablet',
    condition: 'Hypertension',
    condColor: '#FF3B30',
    condBg: '#FF3B3015',
    frequency: 'Once Daily',
    mealTime: 'After Meal',
    startDate: 'Mar 01, 2024',
    endDate: 'Ongoing',
    addedBy: 'Myself',
    linkedPlan: null,
    clinicalInstruction: 'Take at the same time each evening. Report any unexplained muscle pain.',
    prescribedBy: 'Dr. Sarah Kim',
    specialty: 'Cardiology',
  },
  {
    id: 'm5',
    status: 'inactive',
    drug: 'Orlistat',
    dosage: '120 mg',
    form: 'Capsule',
    condition: 'Obesity',
    condColor: '#34C759',
    condBg: '#34C75915',
    frequency: 'Three Times Daily',
    mealTime: 'With Meal',
    startDate: 'Jan 10, 2025',
    endDate: 'Jan 10, 2026',
    addedBy: 'Doctor',
    linkedPlan: 'Obesity Reduction & Lifestyle Plan',
    clinicalInstruction: 'Take with each main meal containing fat. Follow a reduced-calorie diet.',
    prescribedBy: 'Dr. Marcus Reid',
    specialty: 'Internal Medicine',
  },
] as const;

const ADDED_BY_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  EHR: { color: '#007AFF', bg: '#007AFF12', label: 'EHR' },
  Doctor: { color: '#34C759', bg: '#34C75912', label: 'Doctor' },
  Myself: { color: '#AF52DE', bg: '#AF52DE12', label: 'Myself' },
  Patient: { color: '#AF52DE', bg: '#AF52DE12', label: 'Patient' },
};

function MedDetailScreen({ medId, onBack }: { medId: string; onBack: () => void }): React.JSX.Element {
  const med = MED_DATA.find((m) => m.id === medId)!;
  const addedStyle = ADDED_BY_STYLE[med.addedBy] ?? ADDED_BY_STYLE.EHR;
  const isActive = med.status === 'active';

  const FieldRow = ({ label, value }: { label: string; value: string }) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '9px 0',
        borderBottom: '1px solid #F2F2F7',
      }}
    >
      <span style={{ fontSize: '12px', color: '#8E8E93' }}>{label}</span>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C1C1E', textAlign: 'right', maxWidth: '58%' }}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="h-full flex flex-col" style={{ ...SF, background: '#F2F2F7' }}>
      {/* nav */}
      <div className="bg-white flex items-center gap-3 px-4 pt-3 pb-3" style={{ borderBottom: '1px solid #F2F2F7' }}>
        <button
          onClick={onBack}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#F2F2F7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={17} style={{ color: '#1C1C1E' }} strokeWidth={2.5} />
        </button>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1C1E' }}>{med.drug}</p>
          <p style={{ fontSize: '11px', color: '#8E8E93' }}>
            {med.dosage} · {med.form}
          </p>
        </div>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: isActive ? '#34C759' : '#8E8E93',
            background: isActive ? '#34C75912' : '#F2F2F7',
            borderRadius: '999px',
            padding: '3px 9px',
          }}
        >
          {isActive ? '● Active' : 'Inactive'}
        </span>
      </div>

      {/* scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: 'none' }}>
        {/* med header card */}
        <div className="rounded-2xl bg-white px-4 py-4" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: '#AF52DE12',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PillIcon size={20} style={{ color: '#AF52DE' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.3px' }}>{med.drug}</p>
              <p style={{ fontSize: '12px', color: '#8E8E93' }}>
                {med.dosage} · {med.form}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: med.condColor,
                background: med.condBg,
                borderRadius: '999px',
                padding: '3px 9px',
              }}
            >
              {med.condition}
            </span>
            {med.linkedPlan && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: P,
                  background: `${P}10`,
                  borderRadius: '999px',
                  padding: '3px 9px',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                }}
              >
                {med.linkedPlan.replace(/ Care Plan$/i, '').replace(/ Plan$/i, '')}
              </span>
            )}
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: addedStyle.color,
                background: addedStyle.bg,
                borderRadius: '999px',
                padding: '3px 9px',
              }}
            >
              {addedStyle.label}
            </span>
          </div>
        </div>

        {/* details */}
        <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div className="px-4 pt-3 pb-0">
            <p
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#8E8E93',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                marginBottom: '2px',
              }}
            >
              Medication Details
            </p>
          </div>
          <div className="px-4 pb-1">
            <FieldRow label="Medicine Name" value={med.drug} />
            <FieldRow label="Dosage" value={med.dosage} />
            <FieldRow label="Frequency" value={med.frequency} />
            <FieldRow label="Time of Intake" value={med.mealTime} />
            <FieldRow label="Medication Form" value={med.form} />
            <FieldRow label="Start Date" value={med.startDate} />
            <FieldRow label="End Date" value={med.endDate} />
            <FieldRow label="Medication Status" value={isActive ? 'Active' : 'Inactive'} />
          </div>
        </div>

        {/* clinical instruction */}
        <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div className="px-4 pt-3 pb-2">
            <p
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#8E8E93',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Clinical Instruction
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '3px', alignSelf: 'stretch', borderRadius: '2px', background: P, flexShrink: 0 }} />
              <p style={{ fontSize: '12px', color: '#3C3C3E', lineHeight: 1.6 }}>{med.clinicalInstruction}</p>
            </div>
          </div>
        </div>

        {/* prescribed by */}
        <div className="rounded-2xl bg-white overflow-hidden pb-3" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div className="px-4 pt-3 pb-0">
            <p
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#8E8E93',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                marginBottom: '2px',
              }}
            >
              Prescribed By
            </p>
          </div>
          <div className="px-4 pb-1">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '9px 0',
                borderBottom: '1px solid #F2F2F7',
              }}
            >
              <span style={{ fontSize: '12px', color: '#8E8E93' }}>Physician</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C1C1E' }}>{med.prescribedBy}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0' }}>
              <span style={{ fontSize: '12px', color: '#8E8E93' }}>Specialty</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C1C1E' }}>{med.specialty}</span>
            </div>
          </div>
        </div>

        {/* linked care plan */}
        {med.linkedPlan && (
          <div className="rounded-2xl bg-white px-4 py-3 mb-4" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <p
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#8E8E93',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Linked Care Plan
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: `${P}12`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ClipboardList size={15} style={{ color: P }} />
              </div>
              <p style={{ fontSize: '12.5px', fontWeight: 600, color: P, lineHeight: 1.4 }}>{med.linkedPlan}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MedicationScreen({
  filterAddedBy,
  filterCondition,
  onOpenFilter,
}: {
  filterAddedBy: string;
  filterCondition: string;
  onOpenFilter: () => void;
}): React.JSX.Element {
  const [medTab, setMedTab] = useState<'active' | 'inactive'>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const hasActiveFilter = filterAddedBy !== 'All' || filterCondition !== 'All';

  const visible = MED_DATA.filter((m) => m.status === medTab)
    .filter((m) => filterAddedBy === 'All' || m.addedBy === filterAddedBy)
    .filter((m) => filterCondition === 'All' || m.condition === filterCondition);

  if (selectedId) {
    return <MedDetailScreen medId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="h-full flex flex-col" style={{ ...SF, background: '#F2F2F7' }}>
      {/* header */}
      <div className="bg-white px-5 pt-4 pb-3">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.4px' }}>Medications</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* filter icon button */}
            <button
              onClick={onOpenFilter}
              style={{
                position: 'relative',
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: hasActiveFilter ? `${P}12` : '#F2F2F7',
                border: hasActiveFilter ? `1.5px solid ${P}30` : '1.5px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <SlidersHorizontal size={15} style={{ color: hasActiveFilter ? P : '#8E8E93' }} />
              {hasActiveFilter && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: P,
                    border: '1.5px solid #fff',
                  }}
                />
              )}
            </button>
            {/* add button */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: P,
                borderRadius: '20px',
                padding: '6px 12px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Plus size={13} style={{ color: '#fff' }} strokeWidth={2.5} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Add</span>
            </button>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#F2F2F7',
            borderRadius: '12px',
            padding: '3px',
            gap: '3px',
          }}
        >
          {(['active', 'inactive'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setMedTab(t)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                borderRadius: '9px',
                padding: '6px 0',
                background: medTab === t ? '#fff' : 'transparent',
                boxShadow: medTab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span
                style={{ fontSize: '12px', fontWeight: medTab === t ? 700 : 500, color: medTab === t ? P : '#8E8E93' }}
              >
                {t === 'active' ? 'Active' : 'Inactive'}
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: medTab === t ? P : '#8E8E93',
                  background: medTab === t ? `${P}14` : '#E5E5EA',
                  borderRadius: '999px',
                  padding: '1px 5px',
                }}
              >
                {MED_DATA.filter((m) => m.status === t).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* list */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3"
        style={{ scrollbarWidth: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        {visible.map((med) => {
          const addedStyle = ADDED_BY_STYLE[med.addedBy] ?? ADDED_BY_STYLE.EHR;
          return (
            <button
              key={med.id}
              onClick={() => setSelectedId(med.id)}
              className="text-left w-full bg-white"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                border: 'none',
                borderRadius: '16px',
                display: 'block',
              }}
            >
              {/* card header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px 10px',
                  borderBottom: '1px solid #F2F2F7',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: '#F7F2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <PillIcon size={17} style={{ color: '#AF52DE' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1C1E' }}>{med.drug}</p>
                  <p style={{ fontSize: '11.5px', color: '#8E8E93', marginTop: '1px' }}>
                    {med.dosage} · {med.form}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: med.condColor,
                      background: med.condBg,
                      borderRadius: '999px',
                      padding: '2px 7px',
                    }}
                  >
                    {med.condition}
                  </span>
                </div>
              </div>
              {/* info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #F2F2F7' }}>
                {[
                  { label: 'FREQUENCY', value: med.frequency },
                  { label: 'START DATE', value: med.startDate },
                  { label: 'END DATE', value: med.endDate },
                ].map((f, i) => (
                  <div key={i} style={{ padding: '8px 12px', borderRight: i < 2 ? '1px solid #F2F2F7' : 'none' }}>
                    <p
                      style={{
                        fontSize: '8.5px',
                        fontWeight: 700,
                        color: '#C7C7CC',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        marginBottom: '2px',
                      }}
                    >
                      {f.label}
                    </p>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#1C1C1E' }}>{f.value}</p>
                  </div>
                ))}
              </div>
              {/* footer — col 1: MEAL TIME, col 2: ADDED BY, col 3: chevron right */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                {/* col 1: MEAL TIME — under FREQUENCY */}
                <div style={{ padding: '8px 12px', borderRight: '1px solid #F2F2F7' }}>
                  <p
                    style={{
                      fontSize: '8.5px',
                      fontWeight: 700,
                      color: '#C7C7CC',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      marginBottom: '2px',
                    }}
                  >
                    MEAL TIME
                  </p>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#1C1C1E', margin: 0 }}>{med.mealTime}</p>
                </div>
                {/* col 2: ADDED BY — under START DATE */}
                <div style={{ padding: '8px 12px' }}>
                  <p
                    style={{
                      fontSize: '8.5px',
                      fontWeight: 700,
                      color: '#C7C7CC',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      marginBottom: '2px',
                    }}
                  >
                    ADDED BY
                  </p>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: addedStyle.color, margin: 0 }}>
                    {addedStyle.label}
                  </p>
                </div>
                {/* col 3: empty */}
                <div />
              </div>
              {/* linked care plan row */}
              {med.linkedPlan && (
                <div
                  style={{
                    padding: '8px 14px 10px',
                    borderTop: '1px solid #F2F2F7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '7px',
                      background: `${P}10`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ClipboardList size={11} style={{ color: P }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      style={{
                        fontSize: '8.5px',
                        fontWeight: 700,
                        color: '#C7C7CC',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        marginBottom: '1px',
                      }}
                    >
                      Care Plan
                    </p>
                    <p
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 600,
                        color: P,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {med.linkedPlan.replace(/ Care Plan$/i, '').replace(/ Plan$/i, '')}
                    </p>
                  </div>
                  <ArrowRight size={13} style={{ color: '#C7C7CC', flexShrink: 0 }} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── devices screen ───────────────────────────────────────────────────────────

const DEVICE_LIST = [
  {
    id: 'd1',
    name: 'Blood Pressure Cuff',
    model: 'Omron Platinum BP5450',
    status: 'connected' as const,
    connType: 'Bluetooth',
    conditions: [
      { label: 'Hypertension', color: '#FF3B30', bg: '#FF3B3015' },
      { label: 'Heart Failure', color: '#007AFF', bg: '#007AFF12' },
    ],
    vitals: [
      { label: 'Systolic BP', value: '128 mmHg' },
      { label: 'Diastolic BP', value: '82 mmHg' },
      { label: 'Heart Rate', value: '76 bpm' },
    ],
    lastSync: '2 min ago',
    iconColor: '#FF3B30',
    iconBg: '#FF3B3012',
    Icon: Heart,
  },
  {
    id: 'd2',
    name: 'CGM — Dexcom G7',
    model: 'Dexcom G7',
    status: 'connected' as const,
    connType: 'Bluetooth',
    conditions: [{ label: 'Diabetes', color: '#FF9500', bg: '#FF950015' }],
    vitals: [{ label: 'Blood Glucose', value: '118 mg/dL' }],
    lastSync: 'Just now',
    iconColor: '#FF9500',
    iconBg: '#FF950012',
    Icon: Droplets,
  },
  {
    id: 'd3',
    name: 'Weight Scale',
    model: 'Withings Body+ WS-50',
    status: 'connected' as const,
    connType: 'Bluetooth',
    conditions: [{ label: 'Obesity', color: '#34C759', bg: '#34C75912' }],
    vitals: [{ label: 'Body Weight', value: '184 lbs' }],
    lastSync: '6 hrs ago',
    iconColor: '#007AFF',
    iconBg: '#007AFF12',
    Icon: Scale,
  },
] as const;

type DeviceItem = (typeof DEVICE_LIST)[number];

function DeviceDetailScreen({ device, onBack }: { device: DeviceItem; onBack: () => void }): React.JSX.Element {
  const isConnected = device.status === 'connected';

  return (
    <div className="h-full flex flex-col" style={{ ...SF, background: '#F2F2F7' }}>
      {/* nav */}
      <div className="bg-white flex items-center gap-3 px-4 pt-3 pb-3" style={{ borderBottom: '1px solid #F2F2F7' }}>
        <button
          onClick={onBack}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#F2F2F7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={17} style={{ color: '#1C1C1E' }} strokeWidth={2.5} />
        </button>
        <p style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: '#1C1C1E' }}>{device.name}</p>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: isConnected ? '#34C759' : '#FF3B30',
            background: isConnected ? '#34C75912' : '#FF3B3012',
            borderRadius: '999px',
            padding: '3px 10px',
          }}
        >
          {isConnected ? '● Connected' : '○ Disconnected'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: 'none' }}>
        {/* device identity */}
        <div className="rounded-2xl bg-white px-4 py-4" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: device.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <device.Icon size={24} style={{ color: device.iconColor }} />
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.3px' }}>
                {device.name}
              </p>
              <p style={{ fontSize: '11.5px', color: '#8E8E93', marginTop: '2px' }}>{device.model}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {device.conditions.map((c) => (
              <span
                key={c.label}
                style={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  color: c.color,
                  background: c.bg,
                  borderRadius: '999px',
                  padding: '3px 9px',
                }}
              >
                {c.label}
              </span>
            ))}
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: '#8E8E93',
                background: '#F2F2F7',
                borderRadius: '999px',
                padding: '3px 9px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {device.connType === 'Bluetooth' ? <Bluetooth size={9} /> : <Wifi size={9} />}
              {device.connType}
            </span>
          </div>
        </div>

        {/* latest readings */}
        <div>
          <p
            style={{
              fontSize: '9.5px',
              fontWeight: 700,
              color: '#8E8E93',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              marginBottom: '8px',
              paddingLeft: '4px',
            }}
          >
            Latest Readings
          </p>
          <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            {device.vitals.map((v, i) => (
              <div
                key={v.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '11px 16px',
                  borderBottom: i < device.vitals.length - 1 ? '1px solid #F2F2F7' : 'none',
                }}
              >
                <span style={{ fontSize: '12.5px', color: '#8E8E93' }}>{v.label}</span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: (v.value as string) === '—' ? '#C7C7CC' : '#1C1C1E',
                  }}
                >
                  {v.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* sync info */}
        <div>
          <p
            style={{
              fontSize: '9.5px',
              fontWeight: 700,
              color: '#8E8E93',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              marginBottom: '8px',
              paddingLeft: '4px',
            }}
          >
            Sync Status
          </p>
          <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            {[
              {
                label: 'Connection Status',
                value: isConnected ? 'Connected' : 'Disconnected',
                valueColor: isConnected ? '#34C759' : '#FF3B30',
              },
              { label: 'Connection Method', value: device.connType, valueColor: '#1C1C1E' },
              { label: 'Last Synced', value: device.lastSync, valueColor: '#1C1C1E' },
            ].map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '11px 16px',
                  borderBottom: i < 2 ? '1px solid #F2F2F7' : 'none',
                }}
              >
                <span style={{ fontSize: '12.5px', color: '#8E8E93' }}>{row.label}</span>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: row.valueColor }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* actions */}
        <div className="space-y-2 pb-4">
          {!isConnected && (
            <button
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                background: P,
                borderRadius: '14px',
                padding: '13px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Zap size={15} style={{ color: '#fff' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Reconnect Device</span>
            </button>
          )}
          {isConnected && (
            <button
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                background: '#F2F2F7',
                borderRadius: '14px',
                padding: '13px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} style={{ color: P }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: P }}>Sync Now</span>
            </button>
          )}
          <button
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              background: '#FFF1F0',
              borderRadius: '14px',
              padding: '13px',
              border: '1px solid #FFD5D2',
              cursor: 'pointer',
            }}
          >
            <AlertCircle size={14} style={{ color: '#FF3B30' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#FF3B30' }}>Remove Device</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DevicesScreen(): React.JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedDevice = DEVICE_LIST.find((d) => d.id === selectedId);
  if (selectedDevice) {
    return <DeviceDetailScreen device={selectedDevice} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="h-full flex flex-col" style={{ ...SF, background: '#F2F2F7' }}>
      {/* header */}
      <div className="bg-white px-5 pt-4 pb-3">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h1
              style={{ fontSize: '20px', fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.4px', lineHeight: 1.1 }}
            >
              Devices
            </h1>
          </div>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: P,
              borderRadius: '20px',
              padding: '7px 13px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={13} style={{ color: '#fff' }} strokeWidth={2.5} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Connect</span>
          </button>
        </div>
      </div>

      {/* device cards */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3"
        style={{ scrollbarWidth: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        {DEVICE_LIST.map((device) => {
          const isConnected = device.status === 'connected';
          return (
            <button
              key={device.id}
              onClick={() => setSelectedId(device.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: 'none',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              {/* card top */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px 12px',
                  borderBottom: '1px solid #F2F2F7',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '13px',
                    background: isConnected ? device.iconBg : '#F2F2F7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <device.Icon size={19} style={{ color: isConnected ? device.iconColor : '#C7C7CC' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}
                  >
                    <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#1C1C1E' }}>{device.name}</p>
                    {device.id === 'd1' && (
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 700,
                          color: isConnected ? '#34C759' : '#FF3B30',
                          background: isConnected ? '#34C75912' : '#FF3B3012',
                          borderRadius: '999px',
                          padding: '2px 8px',
                          flexShrink: 0,
                        }}
                      >
                        {isConnected ? '● Connected' : '○ Offline'}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {device.conditions.map((c) => (
                      <span
                        key={c.label}
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 600,
                          color: c.color,
                          background: c.bg,
                          borderRadius: '999px',
                          padding: '1px 7px',
                        }}
                      >
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* vitals row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(device.vitals.length, 3)}, 1fr)`,
                  borderBottom: '1px solid #F2F2F7',
                }}
              >
                {device.vitals.slice(0, 3).map((v, i) => (
                  <div
                    key={v.label}
                    style={{
                      padding: '9px 12px',
                      borderRight: i < Math.min(device.vitals.length, 3) - 1 ? '1px solid #F2F2F7' : 'none',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '8px',
                        fontWeight: 700,
                        color: '#C7C7CC',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        marginBottom: '2px',
                      }}
                    >
                      {v.label}
                    </p>
                    <p
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: (v.value as string) === '—' ? '#C7C7CC' : isConnected ? '#1C1C1E' : '#C7C7CC',
                      }}
                    >
                      {v.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* footer */}
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {device.connType === 'Bluetooth' ? (
                    <Bluetooth size={10} style={{ color: '#8E8E93' }} />
                  ) : (
                    <Wifi size={10} style={{ color: '#8E8E93' }} />
                  )}
                  <span style={{ fontSize: '11px', color: '#8E8E93' }}>{device.connType}</span>
                  <span style={{ fontSize: '10px', color: '#C7C7CC', margin: '0 3px' }}>·</span>
                  <RefreshCw size={9} style={{ color: '#C7C7CC' }} />
                  <span style={{ fontSize: '11px', color: '#C7C7CC' }}>{device.lastSync}</span>
                </div>
                <ArrowRight size={13} style={{ color: '#C7C7CC' }} />
              </div>
            </button>
          );
        })}
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
] as const;

type TabId = (typeof TABS)[number]['id'];

function BottomTabBar({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }): React.JSX.Element {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-40 flex"
      style={{
        background: 'rgba(249,249,251,0.92)',
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
        return (
          <button key={id} onClick={() => onChange(id)} className="flex-1 flex flex-col items-center gap-0.5">
            <Icon
              size={22}
              style={{ color: on ? P : '#8E8E93', strokeWidth: on ? 2.5 : 1.75, transition: 'color 0.15s' }}
            />
            <span
              style={{
                fontSize: '11px',
                fontWeight: on ? 600 : 400,
                color: on ? P : '#8E8E93',
                transition: 'color 0.15s',
              }}
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

const SCREENS: Partial<Record<TabId, React.JSX.Element>> = {
  careplan: <CarePlanScreen />,
  devices: <DevicesScreen />,
};

// ─── main export ──────────────────────────────────────────────────────────────

type AppView = 'signin' | 'otp' | 'app';

export function IPhoneShowcase(): React.JSX.Element {
  const [view, setView] = useState<AppView>('signin');
  const [tab, setTab] = useState<TabId>('dashboard');

  // medication filter state — lifted here so sheet can cover the tab bar
  const [filterAddedBy, setFilterAddedBy] = useState<string>('All');
  const [filterCondition, setFilterCondition] = useState<string>('All');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draftAddedBy, setDraftAddedBy] = useState<string>('All');
  const [draftCondition, setDraftCondition] = useState<string>('All');

  const openMedFilter = () => {
    setDraftAddedBy(filterAddedBy);
    setDraftCondition(filterCondition);
    setSheetOpen(true);
  };
  const applyMedFilters = () => {
    setFilterAddedBy(draftAddedBy);
    setFilterCondition(draftCondition);
    setSheetOpen(false);
  };
  const closeMedSheet = () => setSheetOpen(false);

  const subheadings: Record<AppView, string> = {
    signin: 'Sign In · Mobile Number',
    otp: 'Sign In · OTP Verification',
    app: 'Patient Portal · iOS 18',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: `radial-gradient(ellipse at 30% 20%, ${P} 0%, #08111C 55%, #0A1520 100%)`, ...SF }}
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
          background: P,
          opacity: 0.18,
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
          background: '#2A4A6A',
          opacity: 0.15,
          filter: 'blur(90px)',
        }}
      />

      <div className="relative flex flex-col items-center" style={{ gap: '24px' }}>
        {/* heading */}
        <div className="text-center">
          <p
            className="font-bold uppercase tracking-widest"
            style={{ fontSize: '11px', color: '#6A9BC3', letterSpacing: '3px', marginBottom: '6px' }}
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
                      setTab('careplan');
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
                    {tab === 'dashboard' ? (
                      <DashboardScreen
                        onLogout={() => {
                          setView('signin');
                          setTab('dashboard');
                        }}
                      />
                    ) : tab === 'medication' ? (
                      <MedicationScreen
                        filterAddedBy={filterAddedBy}
                        filterCondition={filterCondition}
                        onOpenFilter={openMedFilter}
                      />
                    ) : (
                      SCREENS[tab]
                    )}
                  </div>
                </div>
                <BottomTabBar active={tab} onChange={setTab} />
                {/* ── medication filter sheet — covers tab bar ── */}
                {sheetOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 50,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      borderRadius: '42px',
                      overflow: 'hidden',
                    }}
                  >
                    {/* backdrop */}
                    <div
                      onClick={closeMedSheet}
                      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }}
                    />
                    {/* sheet */}
                    <div style={{ position: 'relative', background: '#fff', borderRadius: '24px 24px 0 0', zIndex: 1 }}>
                      {/* handle */}
                      <div
                        style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px', paddingBottom: '2px' }}
                      >
                        <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#E5E5EA' }} />
                      </div>
                      {/* title row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          padding: '10px 20px 4px',
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '17px', fontWeight: 700, color: '#1C1C1E', lineHeight: 1.2 }}>Filter</p>
                          <p style={{ fontSize: '11.5px', color: '#8E8E93', marginTop: '3px' }}>
                            Narrow results by source or condition
                          </p>
                        </div>
                        <button
                          onClick={closeMedSheet}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#F2F2F7',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        >
                          <Plus size={13} style={{ color: '#8E8E93', transform: 'rotate(45deg)' }} strokeWidth={2.5} />
                        </button>
                      </div>
                      {/* Added By */}
                      <div style={{ padding: '14px 20px 16px' }}>
                        <p
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#8E8E93',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            marginBottom: '10px',
                          }}
                        >
                          Added By
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {(['All', 'Doctor', 'EHR', 'Myself'] as const).map((opt) => {
                            const active = draftAddedBy === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => setDraftAddedBy(opt)}
                                style={{
                                  fontSize: '12px',
                                  fontWeight: active ? 700 : 500,
                                  color: active ? '#fff' : '#3C3C3E',
                                  background: active ? P : '#F2F2F7',
                                  borderRadius: '999px',
                                  padding: '7px 16px',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* divider */}
                      <div style={{ height: '1px', background: '#F2F2F7', margin: '0 20px 16px' }} />
                      {/* Condition */}
                      <div style={{ padding: '0 20px 20px' }}>
                        <p
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#8E8E93',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            marginBottom: '10px',
                          }}
                        >
                          Condition
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {(['All', 'Hypertension', 'Diabetes', 'Obesity'] as const).map((opt) => {
                            const active = draftCondition === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => setDraftCondition(opt)}
                                style={{
                                  fontSize: '12px',
                                  fontWeight: active ? 700 : 500,
                                  color: active ? '#fff' : '#3C3C3E',
                                  background: active ? P : '#F2F2F7',
                                  borderRadius: '999px',
                                  padding: '7px 16px',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* reset + action buttons */}
                      <div style={{ padding: '0 20px 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={closeMedSheet}
                            style={{
                              flex: 1,
                              padding: '13px',
                              borderRadius: '14px',
                              border: '1.5px solid #E5E5EA',
                              background: '#fff',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#3C3C3E',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={applyMedFilters}
                            style={{
                              flex: 1,
                              padding: '13px',
                              borderRadius: '14px',
                              border: 'none',
                              background: P,
                              fontSize: '13px',
                              fontWeight: 700,
                              color: '#fff',
                              cursor: 'pointer',
                            }}
                          >
                            Apply
                          </button>
                        </div>
                        {(draftAddedBy !== 'All' || draftCondition !== 'All') && (
                          <button
                            onClick={() => {
                              setDraftAddedBy('All');
                              setDraftCondition('All');
                            }}
                            style={{
                              padding: '10px',
                              background: 'none',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#FF3B30',
                              cursor: 'pointer',
                            }}
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
