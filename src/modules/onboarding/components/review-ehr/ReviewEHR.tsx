import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Check,
  Plug,
  PlugZap,
  Trash2,
  AlertCircle,
  Plus,
  ServerCrash,
  Eye,
  EyeOff,
} from 'lucide-react';
import { OnboardingLeftPanel } from '../onboarding-left-panel';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CREATE_PROFILE_PATH, REVIEW_USERS_PATH, REVIEW_EHR_PATH, DASHBOARD_PATH } from '../../constants';

const STEPS = [
  { label: 'Create Profile', path: CREATE_PROFILE_PATH },
  { label: 'Review Assigned Users', path: REVIEW_USERS_PATH },
  { label: 'Review EHR Details', path: REVIEW_EHR_PATH },
];

const EHR_SYSTEM_BADGE_CLASS: Record<string, string> = {
  Epic: 'bg-teal-50 text-teal-700 border-0',
  Cerner: 'bg-orange-50 text-orange-700 border-0',
  // Athena: 'bg-teal-50 text-teal-700 border-0',
  Meditech: 'bg-violet-50 text-violet-700 border-0',
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  Active: 'bg-teal-50 text-teal-700 border-0',
  Inactive: 'bg-red-50 text-red-600 border-0',
  Pending: 'bg-amber-50 text-amber-600 border-0',
};

const STATUS_DOT_CLASS: Record<string, string> = {
  Active: 'bg-emerald-500',
  Inactive: 'bg-rose-500',
  Pending: 'bg-amber-500',
};

interface EHRDetails {
  system: 'Epic' | 'Cerner' | 'Athena' | 'Meditech';
  environment: string;
  clientId: string;
  clientSecret: string;
  fhirBaseUrl: string;
  smartAppEnabled: boolean;
  integrationStatus: 'Active' | 'Inactive' | 'Pending';
  connectedOn: string;
}

const MOCK_EHR: EHRDetails = {
  system: 'Epic',
  environment: 'Production · v10.2',
  clientId: 'client_sunrise_epic_prod_001',
  clientSecret: 'sk-ehr-ep1c-a1b2c3d4e5f6g7h8i9j0',
  fhirBaseUrl: 'https://fhir.sunrisehealth.com/api/FHIR/R4',
  smartAppEnabled: true,
  integrationStatus: 'Active',
  connectedOn: 'Mar 14, 2025',
};

function EHRSetupView({ onComplete }: { onComplete: () => void }): React.JSX.Element {
  const navigate = useNavigate();
  const [ehr] = useState<EHRDetails>(MOCK_EHR);
  const [smartOn, setSmartOn] = useState(ehr.smartAppEnabled);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKey, setShowKey] = useState(false);

  function handleToggleSmart(checked: boolean): void {
    setSmartOn(checked);
    toast.success(`SMART App ${checked ? 'enabled' : 'disabled'}`);
  }

  function handleRemove(): void {
    toast.error('Connection removed. Contact Super Admin to reconnect.');
  }

  async function handleContinue(): Promise<void> {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsSubmitting(false);
    onComplete();
  }

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader className="border-b py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center rounded-xl w-[42px] h-[42px] ${EHR_SYSTEM_BADGE_CLASS[ehr.system]}`}
              >
                <PlugZap size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{ehr.system} EHR</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-border px-0">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-xs font-semibold text-muted-foreground">Client ID</span>
            <span className="text-xs font-mono text-foreground tracking-wide">{ehr.clientId}</span>
          </div>

          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-xs font-semibold text-muted-foreground">Client Secret</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-foreground tracking-wide">
                {showKey ? ehr.clientSecret : '••••••••••••••••••••••'}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? 'Hide secret' : 'Show secret'}
                className="text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-xs font-semibold text-muted-foreground">FHIR Base URL</span>
            <span className="text-xs font-mono text-foreground tracking-wide">{ehr.fhirBaseUrl}</span>
          </div>

          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-xs font-semibold text-muted-foreground">Connected On</span>
            <span className="text-xs font-medium text-foreground">{ehr.connectedOn}</span>
          </div>

          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground" htmlFor="smart-toggle">
                SMART App Integration
              </Label>
              <p className="text-[11px] mt-0.5 text-muted-foreground">Enables secure third-party app access</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="smart-toggle" checked={smartOn} onCheckedChange={handleToggleSmart} />
              <span className={`text-xs font-semibold ${smartOn ? 'text-primary' : 'text-muted-foreground'}`}>
                {smartOn ? 'On' : 'Off'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-xs font-semibold text-muted-foreground">Integration Status</span>
            <Badge variant="outline" className={STATUS_BADGE_CLASS[ehr.integrationStatus]}>
              <span
                className={`inline-block rounded-full w-1.5 h-1.5 mr-1.5 ${STATUS_DOT_CLASS[ehr.integrationStatus]}`}
              />
              {ehr.integrationStatus}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
          >
            <Trash2 size={13} />
            Remove Connection
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-4 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
        <AlertCircle size={15} className="text-primary shrink-0" />
        <p className="flex-1 text-xs text-foreground leading-relaxed">
          <span className="font-semibold">Set up by Super Admin.</span> Contact Super Admin Support to modify EHR system
          or credentials.
        </p>
        <Button type="button" variant="outline" size="xs" className="shrink-0 text-xs whitespace-nowrap">
          Contact Super Admin
        </Button>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(REVIEW_USERS_PATH)}
          className="h-11 px-5 text-sm font-semibold"
        >
          ← Back
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={handleContinue}
          className="h-11 px-6 text-sm font-semibold"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin w-4 h-4" />
              Saving…
            </>
          ) : (
            <>
              Continue <ArrowRight size={15} />
            </>
          )}
        </Button>
      </div>
    </>
  );
}

function EHREmptyView({ onComplete }: { onComplete: () => void }): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <>
      <Card className="rounded-2xl border-dashed border-2 shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-14 px-8 text-center">
          <div className="relative mb-6">
            <div className="flex items-center justify-center rounded-full w-20 h-20 bg-muted border border-border">
              <ServerCrash size={36} className="text-muted-foreground/50" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full w-[26px] h-[26px] bg-amber-50 border-2 border-card">
              <Plug size={13} className="text-amber-500" />
            </div>
          </div>

          <h3 className="font-bold text-foreground text-base mb-2">No EHR System Connected</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-[320px]">
            Your Super Admin hasn't set up an EHR integration yet. You can add EHR details now or continue and set it up
            later.
          </p>

          <Button
            type="button"
            onClick={() => toast.info('EHR setup flow coming soon!')}
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold"
          >
            <Plus size={15} />
            Add EHR Details
          </Button>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
        <AlertCircle size={15} className="text-amber-600 shrink-0" />
        <p className="flex-1 text-xs text-amber-800 leading-relaxed">
          <span className="font-semibold">EHR not required to proceed.</span> You can complete onboarding and connect
          EHR from the dashboard later.
        </p>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(REVIEW_USERS_PATH)}
          className="h-11 px-5 text-sm font-semibold"
        >
          ← Back
        </Button>
        <Button type="button" onClick={onComplete} className="h-11 px-6 text-sm font-semibold">
          Skip for Now <ArrowRight size={15} />
        </Button>
      </div>
    </>
  );
}

const COMPLETED_STEPS = [
  { label: 'Profile Created', detail: 'Admin name, email, and phone number saved.' },
  { label: 'Users Reviewed', detail: 'Assigned physicians and staff confirmed.' },
  { label: 'EHR Details Reviewed', detail: 'Integration settings reviewed and confirmed.' },
];

export function ReviewEHR(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasEHR = searchParams.get('scenario') !== 'empty';
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="min-h-screen flex">
      <OnboardingLeftPanel />

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:px-20 overflow-y-auto bg-stone-50">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="flex items-center justify-center rounded-xl bg-primary w-9 h-9">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-bold text-foreground text-base">Health Telematix</span>
        </div>

        <div className="w-full max-w-[768px]">
          {/* Stepper */}
          <div className="flex items-center mb-8">
            {STEPS.map((step, idx) => {
              const isActive = idx === 2;
              const isCompleted = idx < 2;
              const isLast = idx === STEPS.length - 1;
              return (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center min-w-0">
                    <div
                      className={`flex items-center justify-center rounded-full flex-shrink-0 w-8 h-8 border-2 transition-all ${
                        isCompleted || isActive ? 'bg-primary border-primary' : 'bg-muted border-border'
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={14} className="text-primary-foreground" strokeWidth={3} />
                      ) : (
                        <span
                          className={`text-xs font-bold ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                        >
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium mt-1.5 text-center whitespace-nowrap leading-snug ${
                        isActive || isCompleted ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={`flex-1 mx-2 h-0.5 mb-[22px] rounded-sm ${isCompleted ? 'bg-primary' : 'bg-border'}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-foreground text-[22px] tracking-tight mb-1">Review EHR Details</h2>
            <p className="text-sm text-muted-foreground">
              {hasEHR
                ? 'Your EHR system has been connected by the Super Admin. Review the details below.'
                : 'No EHR system has been set up yet. You can add it now or skip and configure it later.'}
            </p>
          </div>

          {hasEHR ? (
            <EHRSetupView onComplete={() => setShowSuccess(true)} />
          ) : (
            <EHREmptyView onComplete={() => setShowSuccess(true)} />
          )}
        </div>
      </div>

      {/* Onboarding Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={() => {}}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[440px] sm:max-w-[440px] p-0 gap-0 overflow-hidden rounded-2xl"
        >
          {/* ── Animated illustration ── */}
          <div className="bg-gradient-to-b from-emerald-50/80 to-white pt-10 pb-6 flex flex-col items-center px-6 text-center">
            <style>{`
              @keyframes ob-ring-1 {
                0%   { transform: scale(0.6); opacity: 0.6; }
                100% { transform: scale(1.6); opacity: 0; }
              }
              @keyframes ob-ring-2 {
                0%   { transform: scale(0.6); opacity: 0.4; }
                100% { transform: scale(1.9); opacity: 0; }
              }
              @keyframes ob-circle-in {
                0%   { transform: scale(0); opacity: 0; }
                60%  { transform: scale(1.12); opacity: 1; }
                80%  { transform: scale(0.96); }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes ob-check {
                from { stroke-dashoffset: 64; }
                to   { stroke-dashoffset: 0; }
              }
              @keyframes ob-sparkle {
                0%   { opacity: 0; transform: scale(0) rotate(0deg); }
                50%  { opacity: 1; }
                100% { opacity: 0; transform: scale(1.4) rotate(25deg); }
              }
              .ob-ring-1 { animation: ob-ring-1 1.2s cubic-bezier(0,0,0.2,1) 0.15s forwards; }
              .ob-ring-2 { animation: ob-ring-2 1.4s cubic-bezier(0,0,0.2,1) 0.05s forwards; }
              .ob-circle { animation: ob-circle-in 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
              .ob-check  { stroke-dasharray: 64; stroke-dashoffset: 64; animation: ob-check 0.45s cubic-bezier(0.65,0,0.35,1) 0.5s forwards; }
              .ob-sparkle-1 { animation: ob-sparkle 0.7s ease-out 0.55s both; }
              .ob-sparkle-2 { animation: ob-sparkle 0.7s ease-out 0.65s both; }
              .ob-sparkle-3 { animation: ob-sparkle 0.7s ease-out 0.60s both; }
              .ob-sparkle-4 { animation: ob-sparkle 0.7s ease-out 0.70s both; }
            `}</style>

            {/* Illustration */}
            <div className="relative flex items-center justify-center w-28 h-28 mb-5">
              <div className="ob-ring-2 absolute w-20 h-20 rounded-full bg-emerald-400/20" />
              <div className="ob-ring-1 absolute w-20 h-20 rounded-full bg-emerald-400/30" />
              <div className="ob-sparkle-1 absolute top-1 right-3 w-2.5 h-2.5 rounded-full bg-emerald-300" />
              <div className="ob-sparkle-2 absolute bottom-2 right-1 w-2 h-2 rounded-full bg-teal-400" />
              <div className="ob-sparkle-3 absolute top-2 left-2 w-2 h-2 rounded-full bg-emerald-400" />
              <div className="ob-sparkle-4 absolute bottom-1 left-4 w-1.5 h-1.5 rounded-full bg-teal-300" />
              <div className="ob-circle w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">
                <svg width="34" height="27" viewBox="0 0 34 27" fill="none">
                  <path
                    className="ob-check"
                    d="M3 13.5L12.5 23L31 3"
                    stroke="white"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <h2 className="font-bold text-foreground text-[19px] tracking-tight mb-1.5">Onboarding Complete!</h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[300px]">
              Your clinic admin profile has been successfully set up. Here's a summary of what was completed.
            </p>
          </div>

          {/* ── Steps summary ── */}
          <div className="mx-6 mb-5 rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden bg-slate-50/50">
            {COMPLETED_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-start gap-3 px-4 py-3.5">
                <div className="flex items-center justify-center rounded-full w-5 h-5 bg-emerald-50 border border-emerald-200 shrink-0 mt-0.5">
                  <Check size={11} className="text-emerald-600" strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-semibold text-foreground">{step.label}</p>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">{step.detail}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">
                  Step {i + 1}
                </span>
              </div>
            ))}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 pb-6">
            <Button
              type="button"
              className="w-full h-11 text-sm font-semibold shadow-xs"
              onClick={() => navigate(DASHBOARD_PATH)}
            >
              Go to Dashboard <ArrowRight size={15} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
