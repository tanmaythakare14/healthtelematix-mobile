import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Mail, RotateCcw } from 'lucide-react';
import { OnboardingLeftPanel } from '../onboarding-left-panel';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { SET_PASSWORD_PATH } from '../../constants';

const OTP_LENGTH = 6;
const TIMER_SECONDS = 120;

export function EmailVerification(): React.JSX.Element {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);

  const isComplete = otp.length === OTP_LENGTH;
  const canResend = timeLeft === 0;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const formatTime = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleResend = useCallback(() => {
    setOtp('');
    setTimeLeft(TIMER_SECONDS);
    toast.success('A new verification code has been sent to your email.');
  }, []);

  async function handleVerify(): Promise<void> {
    if (!isComplete) return;
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsVerifying(false);
    toast.success('Email verified successfully!');
    navigate(SET_PASSWORD_PATH);
  }

  return (
    <div className="min-h-screen flex">
      <OnboardingLeftPanel />

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-20 bg-stone-50">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="flex items-center justify-center rounded-xl bg-primary w-9 h-9">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-bold text-foreground text-base">Health Telematix</span>
        </div>

        <div className="w-full max-w-[620px]">
          <div className="inline-flex items-center justify-center rounded-2xl mb-6 w-14 h-14 bg-primary/10 border border-primary/20">
            <Mail size={24} className="text-primary" />
          </div>

          <div className="mb-8">
            <h2 className="font-bold text-foreground text-2xl tracking-tight mb-2">Check your email</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We've sent a 6-digit verification code to{' '}
              <span className="font-semibold text-foreground" data-phi>
                sarah.mitchell@sunrisecare.com
              </span>
              . Enter the code below to verify your email address.
            </p>
          </div>

          <div className="mb-3">
            <p className="text-sm font-semibold text-foreground mb-3">Verification Code</p>
            <InputOTP maxLength={OTP_LENGTH} value={otp} onChange={setOtp} containerClassName="w-full">
              <InputOTPGroup className="w-full gap-3">
                {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="flex-1 h-18 rounded-xl text-xl font-bold border-2 border-input"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="flex items-center gap-1.5 mb-8 min-h-6">
            {canResend ? (
              <>
                <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleResend}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary p-0 h-auto"
                >
                  <RotateCcw size={13} />
                  Resend code
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Resend code in</p>
                <span className="text-sm font-semibold tabular-nums text-primary">{formatTime(timeLeft)}</span>
              </>
            )}
          </div>

          <Button
            type="button"
            disabled={!isComplete || isVerifying}
            onClick={handleVerify}
            className="w-full h-11 text-sm font-semibold"
          >
            {isVerifying ? (
              <>
                <span className="inline-block rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin w-4 h-4" />
                Validating…
              </>
            ) : (
              <>
                Validate &amp; Set Password
                <ArrowRight size={15} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
