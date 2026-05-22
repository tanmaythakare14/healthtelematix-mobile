import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, CheckCircle2, FlaskConical, Loader2, Mail } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OnboardingLeftPanel } from '../onboarding-left-panel';
import { LOGIN_PATH, RESET_PASSWORD_PATH } from '../../constants';

// ─── Schema ───────────────────────────────────────────────────────────────────

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// ─── Success State ─────────────────────────────────────────────────────────────

function SuccessView({
  email,
  onBack,
  onDemoReset,
}: {
  email: string;
  onBack: () => void;
  onDemoReset: () => void;
}): React.JSX.Element {
  return (
    <div className="w-full max-w-[420px] flex flex-col">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
        <CheckCircle2 size={32} className="text-primary" strokeWidth={1.75} />
      </div>

      <h2 className="text-[22px] font-bold text-foreground tracking-tight mb-2">Check your inbox</h2>
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-1">We've sent a password reset link to</p>
      <p className="text-[14px] font-semibold text-foreground mb-6" data-phi="true">
        {email}
      </p>

      {/* Info card */}
      <div className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-left mb-6 space-y-2.5">
        {[
          "Check your spam or junk folder if you don't see it.",
          'The link will expire in 30 minutes.',
          'Only the most recently sent link will be valid.',
        ].map((tip) => (
          <div key={tip} className="flex items-start gap-2.5">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            <p className="text-[13px] text-muted-foreground leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>

      {/* ── Demo guide ── */}
      <div className="w-full rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 mb-4 flex items-start gap-3 text-left">
        <FlaskConical size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-amber-700 mb-0.5">Demo only</p>
          <p className="text-[12px] text-amber-600 leading-relaxed">
            In production this link arrives via email.{' '}
            <button
              type="button"
              onClick={onDemoReset}
              className="font-semibold underline underline-offset-2 hover:text-amber-800 transition-colors"
            >
              Click here to open Reset Password →
            </button>
          </p>
        </div>
      </div>

      <Button type="button" onClick={onBack} className="w-full h-11 text-[14px] font-semibold rounded-lg shadow-xs">
        Back to Sign In
      </Button>

      <p className="mt-4 text-[13px] text-muted-foreground">
        Didn't receive it?{' '}
        <button
          type="button"
          onClick={onBack}
          className="font-semibold text-primary hover:underline underline-offset-2 transition-colors"
        >
          Try a different email
        </button>
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ForgotPassword(): React.JSX.Element {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordFormValues): Promise<void> {
    setIsLoading(true);
    // Mock API call — replace with real service call
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setSentEmail(values.email);
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

        {sentEmail ? (
          <SuccessView
            email={sentEmail}
            onBack={() => navigate(LOGIN_PATH)}
            onDemoReset={() => navigate(RESET_PASSWORD_PATH)}
          />
        ) : (
          <div className="w-full max-w-[420px]">
            {/* Back link */}
            <button
              type="button"
              onClick={() => navigate(LOGIN_PATH)}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors mb-7"
            >
              <ArrowLeft size={14} strokeWidth={2.5} />
              Back to Sign In
            </button>

            {/* Icon + Heading */}
            <div className="mb-7">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Mail size={20} className="text-primary" />
              </div>
              <h1 className="text-[26px] font-bold text-foreground tracking-tight mb-1.5">Forgot your password?</h1>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                Enter your admin email address and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold text-foreground">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@clinicname.com"
                          autoComplete="email"
                          data-phi="true"
                          className="h-11 text-sm rounded-lg"
                          {...field}
                        />
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
                      Sending reset link…
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}

        {/* Footer */}
        <p className="mt-10 text-[12px] text-muted-foreground">© 2026 Health Telematix. All rights reserved.</p>
      </div>
    </div>
  );
}
