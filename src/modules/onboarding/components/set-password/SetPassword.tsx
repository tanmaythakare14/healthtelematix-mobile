import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';
import { OnboardingLeftPanel } from '../onboarding-left-panel';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { CREATE_PROFILE_PATH } from '../../constants';

const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/\d/, 'Must contain at least one number')
      .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;

interface PasswordRule {
  label: string;
  test: (v: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'One number', test: (v) => /\d/.test(v) },
  { label: 'One special character', test: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v) },
];

const STRENGTH_META = [
  { label: 'Weak', bar: 'bg-red-400' },
  { label: 'Fair', bar: 'bg-orange-400' },
  { label: 'Good', bar: 'bg-yellow-400' },
  { label: 'Strong', bar: 'bg-emerald-400' },
];

function getStrengthScore(password: string): number {
  return PASSWORD_RULES.filter((r) => r.test(password)).length;
}

function PasswordStrengthBar({ password }: { password: string }): React.JSX.Element | null {
  if (!password) return null;
  const score = getStrengthScore(password);
  const metaIndex = score <= 1 ? 0 : score <= 3 ? 1 : score === 4 ? 2 : 3;
  const meta = STRENGTH_META[metaIndex];
  const barFill = Math.min(score, 4);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i < barFill ? meta.bar : 'bg-slate-200'
            )}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {PASSWORD_RULES.map((rule) => {
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

export function SetPassword(): React.JSX.Element {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const watchedPassword = form.watch('password');

  async function onSubmit(): Promise<void> {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
    toast.success('Password set successfully!');
    navigate(CREATE_PROFILE_PATH);
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
            <KeyRound size={24} className="text-primary" />
          </div>

          <div className="mb-8">
            <h2 className="font-bold text-foreground text-2xl tracking-tight mb-2">Set your password</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create a strong password to secure your Clinic Admin account. You'll use this to sign in going forward.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your new password"
                          autoComplete="new-password"
                          className="h-11 text-sm pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </FormControl>

                    <PasswordStrengthBar password={watchedPassword} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">Re-Enter New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Confirm your new password"
                          autoComplete="new-password"
                          className="h-11 text-sm pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setShowConfirm((p) => !p)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-1">
                <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-sm font-semibold">
                  {isSubmitting ? (
                    <>
                      <span className="inline-block rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin w-4 h-4" />
                      Setting password…
                    </>
                  ) : (
                    <>
                      Set Password
                      <ArrowRight size={15} />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
