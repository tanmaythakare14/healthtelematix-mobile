import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { AdminProfileFormValues } from '../../@types';

// ─── Mock admin data ──────────────────────────────────────────────────────────

const ADMIN = {
  fullName: 'Sarah Mitchell',
  email: 'sarah.mitchell@healthtelematix.com',
  npiNumber: '1234567899',
  isPhysician: true,
  phone: '(312) 555-0200',
  initials: 'SM',
};

// ─── Phone formatter ─────────────────────────────────────────────────────────

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Enter a valid 10-digit phone number'),
});

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminProfile(): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  const form = useForm<AdminProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: ADMIN.phone },
  });

  const isDirty = form.formState.isDirty;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function onSubmit(values: AdminProfileFormValues): void {
    void values;
    toast.success('Profile updated successfully');
  }

  return (
    <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-[13.5px] font-bold text-foreground">Admin Profile</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Name and email are managed by Super Admin. You can update your phone number and profile picture.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="px-6 py-6 space-y-6">
            {/* Profile picture row — avatar + button + hint all inline */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="shrink-0">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-lg font-bold select-none">
                    {ADMIN.initials}
                  </div>
                )}
              </div>

              {/* Upload button + hint inline */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={13} />
                Upload Photo
              </Button>
              <p className="text-[11.5px] text-muted-foreground">JPG, PNG · max 2 MB</p>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Admin Name — disabled */}
              <FormItem>
                <FormLabel className="text-[12px]">Admin Name</FormLabel>
                <FormControl>
                  <Input
                    value={ADMIN.fullName}
                    disabled
                    className="h-9 text-sm bg-slate-50 text-foreground border-slate-200 cursor-not-allowed select-none"
                  />
                </FormControl>
              </FormItem>

              {/* Email — disabled */}
              <FormItem>
                <FormLabel className="text-[12px]">Email Address</FormLabel>
                <FormControl>
                  <Input
                    value={ADMIN.email}
                    disabled
                    className="h-9 text-sm bg-slate-50 text-foreground border-slate-200 cursor-not-allowed select-none"
                  />
                </FormControl>
              </FormItem>

              {/* Assigned Role — read-only badge */}
              <FormItem>
                <FormLabel className="text-[12px]">Assigned Role</FormLabel>
                <div className="h-9 flex items-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck size={12} />
                    Clinic Admin
                  </span>
                </div>
              </FormItem>

              {/* Phone — editable */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Phone Number</FormLabel>
                    <FormControl>
                      <div className="flex h-9 rounded-lg border border-input bg-background overflow-hidden transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                        <div className="flex items-center gap-1.5 px-3 bg-muted border-r border-border text-sm text-foreground font-medium select-none shrink-0">
                          🇺🇸 <span className="text-muted-foreground">+1</span>
                        </div>
                        <input
                          type="tel"
                          placeholder="(555) 000-0000"
                          autoComplete="tel"
                          data-phi="true"
                          className="flex-1 px-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                          value={field.value}
                          onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="default"
              className="px-7 h-9"
              disabled={!isDirty}
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button type="submit" size="default" disabled={!isDirty} className="px-7 h-9 shadow-xs">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
