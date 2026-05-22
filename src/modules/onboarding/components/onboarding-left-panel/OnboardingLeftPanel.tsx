import React from 'react';
import { Shield, Users, Activity } from 'lucide-react';

const FEATURES = [
  {
    icon: <Shield size={16} />,
    title: 'HIPAA Compliant & Secure',
    desc: 'End-to-end encryption for all patient data',
  },
  {
    icon: <Users size={16} />,
    title: 'Multi-Role Care Teams',
    desc: 'Physicians, Nurses & Digital Health Navigators',
  },
  {
    icon: <Activity size={16} />,
    title: 'Real-Time Patient Monitoring',
    desc: 'RPM & APCM program tracking with live vitals',
  },
];

export function OnboardingLeftPanel(): React.JSX.Element {
  return (
    <div className="hidden lg:flex lg:w-[30%] flex-col relative overflow-hidden bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950">
      {/* Background decorations */}
      <div className="absolute -top-24 -right-24 rounded-full opacity-10 w-80 h-80 bg-white" />
      <div className="absolute -bottom-16 -left-16 rounded-full opacity-10 w-72 h-72 bg-white" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5 bg-white w-[500px] h-[500px]" />

      <div className="relative z-10 flex flex-col h-full px-10 py-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-xl bg-white/20 shadow-xs w-11 h-11">
            <Activity size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Health Telematix</p>
            <p className="text-white/60 text-xs font-medium">Clinic Admin Portal</p>
          </div>
        </div>

        <div className="flex flex-col flex-1 justify-center">
          {/* Headline */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold bg-white/15 text-white">
              <span className="inline-block rounded-full w-1.5 h-1.5 bg-emerald-400" />
              HIPAA Compliant Platform
            </div>
            <h1 className="text-4xl xl:text-[2.6rem] font-bold text-white leading-snug mb-3">
              Intelligent Care Management for
              <br />
              <span className="text-teal-200">Modern Clinics</span>
            </h1>
            <p className="text-white/70 text-base leading-relaxed max-w-xs">
              Streamline patient care, manage your team, and monitor health outcomes all in one secure platform.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-5 w-full">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3 text-left">
                <div className="flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5 w-8 h-8 bg-white/15 text-white">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{f.title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
