import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OnboardingLeftPanel } from '../onboarding-left-panel';
import { DASHBOARD_PATH, FORGOT_PASSWORD_PATH } from '../../constants';

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export function Login(): React.JSX.Element {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(): Promise<void> {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    navigate(DASHBOARD_PATH);
  }

  return (
    <div className="min-h-screen flex">
      <OnboardingLeftPanel />

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:px-20 overflow-y-auto bg-stone-50">
        {/* Mobile logo — hidden on lg where left panel shows */}
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="flex items-center justify-center rounded-xl bg-primary w-9 h-9 shadow-xs">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-bold text-foreground text-[15px]">Health Telematix</span>
        </div>

        <div className="w-full max-w-[420px]">
          {/* ── Heading ── */}
          <div className="mb-7">
            <h1 className="text-[26px] font-bold text-foreground tracking-tight mb-1.5">Welcome back 👋</h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Sign in to manage your care programs and patient health data.
            </p>
          </div>

          {/* ── Form ── */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
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

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-semibold text-foreground">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          className="h-11 text-sm rounded-lg pr-11"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((o) => !o)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11.5px]" />
                  </FormItem>
                )}
              />

              {/* Forgot password */}
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => navigate(FORGOT_PASSWORD_PATH)}
                  className="text-[13px] font-semibold text-primary hover:underline underline-offset-2 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-[14px] font-semibold rounded-lg mt-1 shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </Button>
            </form>
          </Form>

          {/* ── Legal ── */}
          <p className="mt-5 text-center text-[12px] text-muted-foreground leading-relaxed">
            By signing in, you agree to our{' '}
            <button type="button" className="font-semibold text-primary hover:underline underline-offset-2">
              Privacy Policy
            </button>{' '}
            &{' '}
            <button type="button" className="font-semibold text-primary hover:underline underline-offset-2">
              Terms of Service
            </button>
          </p>
        </div>

        {/* ── Footer ── */}
        <p className="mt-10 text-[12px] text-muted-foreground">© 2026 Health Telematix. All rights reserved.</p>
      </div>
    </div>
  );
}
