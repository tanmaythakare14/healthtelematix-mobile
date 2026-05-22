import React, { useRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Check, Lock, Mail, Upload, User, X, ZoomIn, ZoomOut } from 'lucide-react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { OnboardingLeftPanel } from '../onboarding-left-panel';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CREATE_PROFILE_PATH, REVIEW_USERS_PATH } from '../../constants';

const STEPS = [
  { label: 'Create Profile', path: CREATE_PROFILE_PATH },
  { label: 'Review Assigned Users', path: null },
  { label: 'Review EHR Details', path: null },
];

const createProfileSchema = z.object({
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Enter a valid 10-digit phone number'),
});

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

type CreateProfileFormValues = z.infer<typeof createProfileSchema>;

const MOCK_ADMIN = {
  name: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@greenvalleyclinic.com',
};

// ─── Crop helpers ─────────────────────────────────────────────────────────────

function centerSquareCrop(width: number, height: number): Crop {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
}

function getCroppedDataUrl(image: HTMLImageElement, crop: PixelCrop): string {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return canvas.toDataURL('image/jpeg', 0.92);
}

// ─── Image Crop Modal ─────────────────────────────────────────────────────────

interface CropModalProps {
  imgSrc: string;
  onApply: (dataUrl: string) => void;
  onClose: () => void;
}

function CropModal({ imgSrc, onApply, onClose }: CropModalProps): React.JSX.Element {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerSquareCrop(width, height));
  }

  function handleApply() {
    if (!imgRef.current || !completedCrop || completedCrop.width === 0) return;
    const dataUrl = getCroppedDataUrl(imgRef.current, completedCrop);
    onApply(dataUrl);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" onClick={onClose} />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-[520px] mx-4 rounded-2xl bg-white shadow-xs overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-[15px] font-bold text-foreground">Crop Profile Photo</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">Drag to reposition · resize handles to adjust</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Crop area */}
        <div className="flex items-center justify-center bg-slate-900 px-6 py-6 min-h-[300px]">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
            keepSelection
            minWidth={60}
            minHeight={60}
          >
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-h-[340px] max-w-full object-contain"
              style={{ display: 'block' }}
            />
          </ReactCrop>
        </div>

        {/* Hint */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 border-t border-slate-100 border-b">
          <ZoomIn size={12} className="text-muted-foreground" />
          <p className="text-[11.5px] text-muted-foreground">Drag the circle to reposition · drag corners to resize</p>
          <ZoomOut size={12} className="text-muted-foreground ml-auto" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4">
          <Button type="button" variant="outline" className="h-9 px-5 text-[13px]" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="h-9 px-5 text-[13px] shadow-xs"
            onClick={handleApply}
            disabled={!completedCrop || completedCrop.width === 0}
          >
            Apply Crop
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CreateProfile(): React.JSX.Element {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [cropImgSrc, setCropImgSrc] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateProfileFormValues>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: { phone: '' },
    mode: 'onChange',
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so re-selecting same file triggers onChange again
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCropImgSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  function handleCropApply(dataUrl: string) {
    setAvatarSrc(dataUrl);
    setCropImgSrc(null);
  }

  function handleRemoveAvatar() {
    setAvatarSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function onSubmit(): Promise<void> {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
    toast.success('Profile saved!');
    navigate(REVIEW_USERS_PATH);
  }

  return (
    <>
      {/* Image crop modal — rendered outside the layout flow */}
      {cropImgSrc && <CropModal imgSrc={cropImgSrc} onApply={handleCropApply} onClose={() => setCropImgSrc(null)} />}

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
                const isActive = idx === 0;
                const isCompleted = false;
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
                            className={`text-xs font-bold ${isActive || isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                          >
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium mt-1.5 text-center whitespace-nowrap leading-snug ${
                          isActive ? 'text-primary' : isCompleted ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {!isLast && <div className="flex-1 mx-2 h-0.5 mb-[22px] rounded-sm bg-border" />}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="mb-7">
              <h2 className="font-bold text-foreground text-2xl tracking-tight mb-1.5">Create your profile</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Review your account details and add the finishing touches to complete your admin profile.
              </p>
            </div>

            {/* ── Account Details Card (read-only) ── */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden mb-6">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Account Details
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5">
                  <Lock size={9} strokeWidth={2.5} />
                  From invitation
                </span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-100">
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User size={15} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Admin Name</p>
                    <p className="text-[13.5px] font-semibold text-foreground truncate" data-phi="true">
                      {MOCK_ADMIN.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail size={15} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Email Address</p>
                    <p className="text-[13.5px] font-semibold text-foreground truncate" data-phi="true">
                      {MOCK_ADMIN.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* ── Avatar upload with crop ── */}
                <div className="space-y-2">
                  <Label>Profile Picture</Label>

                  <div className="flex items-center gap-5">
                    {/* Avatar preview */}
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-dashed border-border bg-muted flex items-center justify-center transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Upload profile picture"
                        style={avatarSrc ? { borderStyle: 'solid', borderColor: 'var(--primary)' } : undefined}
                      >
                        {avatarSrc ? (
                          <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User size={28} className="text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    {/* Upload actions */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2 h-9"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload size={13} />
                          {avatarSrc ? 'Change Photo' : 'Upload Photo'}
                        </Button>
                        {avatarSrc && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/8"
                            onClick={handleRemoveAvatar}
                          >
                            <X size={13} />
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-[11.5px] text-muted-foreground">
                        JPG or PNG · max 2 MB · you can crop after selecting
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Phone — editable */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground">
                        Phone Number <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex h-11 rounded-lg border border-input bg-background overflow-hidden transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-1 flex justify-end">
                  <Button type="submit" disabled={isSubmitting} className="h-11 px-6 text-sm font-semibold">
                    {isSubmitting ? (
                      <>
                        <span className="inline-block rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin w-4 h-4" />
                        Saving profile…
                      </>
                    ) : (
                      <>
                        Save & Continue
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
    </>
  );
}
