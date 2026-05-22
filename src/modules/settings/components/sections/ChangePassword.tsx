import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ChangePasswordFormValues } from '../../@types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Password Input ───────────────────────────────────────────────────────────

function PasswordInput({
  placeholder,
  field,
}: {
  placeholder: string;
  field: React.InputHTMLAttributes<HTMLInputElement>;
}): React.JSX.Element {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? 'text' : 'password'} placeholder={placeholder} className="h-9 text-sm pr-9" {...field} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChangePassword(): React.JSX.Element {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const watched = form.watch();
  const hasChanges =
    watched.oldPassword.length > 0 || watched.newPassword.length > 0 || watched.confirmPassword.length > 0;

  function onSubmit(values: ChangePasswordFormValues): void {
    void values;
    toast.success('Password changed successfully');
    form.reset();
  }

  return (
    <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-[13.5px] font-bold text-foreground">Change Password</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Choose a strong password with at least 8 characters, one uppercase letter, and one number.
        </p>
      </div>

      <div className="px-6 py-5 max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">Current Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Enter current password" field={field} />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">New Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Enter new password" field={field} />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">Confirm New Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Re-enter new password" field={field} />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="default"
                className="px-7 h-9"
                disabled={!hasChanges}
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button type="submit" size="default" disabled={!hasChanges} className="px-7 h-9 shadow-xs">
                Save Password
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
