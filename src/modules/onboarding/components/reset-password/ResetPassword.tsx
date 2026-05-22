import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Check, Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { OnboardingLeftPanel } from '../onboarding-left-panel';
import { LOGIN_PATH } from '../../constants';

// ─── Schema ───────────────────────────────────────────────────────────────────

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[0-9]/, 'Must include at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must include at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// ─── Password strength ────────────────────────────────────────────────────────

interface StrengthRule {
  label: string;
  test: (v: string) => boolean;
}

const STRENGTH_RULES: StrengthRule[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One number', test: (v) => /[0-9]/.test(v) },
  { label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function getStrengthScore(password: string): number {
  return STRENGTH_RULES.filter((r) => r.test(password)).length;
}

const STRENGTH_META = [
  { label: 'Weak', bar: 'bg-red-400' },
  { label: 'Fair', bar: 'bg-orange-400' },
  { label: 'Good', bar: 'bg-yellow-400' },
  { label: 'Strong', bar: 'bg-emerald-400' },
];

function PasswordStrengthBar({ password }: { password: string }): React.JSX.Element | null {
  if (!password) return null;
  const score = getStrengthScore(password);
  const meta = STRENGTH_META[Math.max(0, score - 1)];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn('h-1 flex-1 rounded-full transition-all duration-300', i < score ? meta.bar : 'bg-slate-200')}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {STRENGTH_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-1.5">
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors',
                  passed ? 'bg-emerald-400' : 'bg-slate-300'
                )}
              />
              <span
                className={cn(
                  'text-[11.5px] transition-colors',
                  passed ? 'text-emerald-600 font-medium' : 'text-muted-foreground'
                )}
              >
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Success Dialog ───────────────────────────────────────────────────────────

const RESET_SUMMARY = [
  {
    label: 'Password Updated',
    desc: 'Your new password is encrypted and saved securely.',
    step: 'Step 1',
  },
  {
    label: 'Sessions Cleared',
    desc: 'All existing signed-in sessions have been signed out.',
    step: 'Step 2',
  },
  {
    label: 'Ready to Sign In',
    desc: 'Use your new password to access your account.',
    step: 'Step 3',
  },
];

function SuccessDialog({ open, onSignIn }: { open: boolean; onSignIn: () => void }): React.JSX.Element {
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-[420px] p-0 overflow-hidden rounded-2xl" showCloseButton={false}>
        <div className="overflow-hidden rounded-[inherit]">
          {/* ── Gradient header ── */}
          <div className="bg-gradient-to-b from-emerald-50/90 to-white pt-10 pb-6 flex flex-col items-center px-6 text-center">
            {/* Animated check circle */}
            <div className="relative mb-5">
              {/* Outer pulse ring */}
              <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">
                <ShieldCheck size={36} className="text-white" strokeWidth={2.2} />
              </div>
            </div>

            <h2 className="font-bold text-foreground text-[20px] tracking-tight mb-1.5">
              Password Reset Successfully!
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[270px]">
              Your account is secured with your new password. You're all set to sign in.
            </p>
          </div>

          {/* ── Summary steps ── */}
          <div className="mx-6 mb-5 rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden bg-slate-50/50">
            {RESET_SUMMARY.map((item) => (
              <div key={item.label} className="flex items-start gap-3 px-4 py-3.5">
                <div className="flex items-center justify-center rounded-full w-5 h-5 bg-emerald-50 border border-emerald-200 shrink-0 mt-0.5">
                  <Check size={11} className="text-emerald-600" strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">{item.label}</p>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
                <span className="text-[11px] font-semibold text-primary bg-primary/8 border border-primary/15 px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                  {item.step}
                </span>
              </div>
            ))}
          </div>

          {/* ── CTA ── */}
          <div className="px-6 pb-6">
            <Button type="button" onClick={onSignIn} className="w-full h-11 text-[14px] font-semibold gap-2 shadow-xs">
              Go to Sign In <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ResetPassword(): React.JSX.Element {
  const navigate = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const watchedPassword = form.watch('newPassword');

  async function onSubmit(): Promise<void> {
    setIsLoading(true);
    // Mock API — replace with real service call
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setIsSuccess(true);
  }

  return (
    <div className="min-h-screen flex">
      <OnboardingLeftPanel />

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:px-20 overflow-y-auto bg-stone-50">
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="flex items-center justify-center rounded-xl bg-primary w-9 h-9 shadow-xs">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-bold text-foreground text-[15px]">Health Telematix</span>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Icon + Heading */}
          <div className="mb-7">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <KeyRound size={20} className="text-primary" />
            </div>
            <h1 className="text-[26px] font-bold text-foreground tracking-tight mb-1.5">Set a new password</h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Choose a strong password to keep your account secure.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* New Password */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-semibold text-foreground">New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNew ? 'text' : 'password'}
                          placeholder="Create a new password"
                          autoComplete="new-password"
                          className="h-11 text-sm rounded-lg pr-11"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew((o) => !o)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                          aria-label={showNew ? 'Hide password' : 'Show password'}
                        >
                          {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <PasswordStrengthBar password={watchedPassword} />
                    <FormMessage className="text-[11.5px]" />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-semibold text-foreground">Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Re-enter your new password"
                          autoComplete="new-password"
                          className="h-11 text-sm rounded-lg pr-11"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((o) => !o)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11.5px]" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-[14px] font-semibold rounded-lg mt-1 shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Resetting password…
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Footer */}
        <p className="mt-10 text-[12px] text-muted-foreground">© 2026 Health Telematix. All rights reserved.</p>
      </div>

      {/* ── Success popup ── */}
      <SuccessDialog open={isSuccess} onSignIn={() => navigate(LOGIN_PATH)} />
    </div>
  );
}
