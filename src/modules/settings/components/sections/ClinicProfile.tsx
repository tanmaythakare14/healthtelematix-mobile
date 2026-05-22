import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, ChevronDown, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { ClinicProfileFormValues } from '../../@types';

// ─── ZIP → Location lookup ────────────────────────────────────────────────────

interface ZipLocation {
  city: string;
  state: string;
  country: string;
}

const ZIP_LOOKUP: Record<string, ZipLocation> = {
  '10001': { city: 'New York', state: 'NY', country: 'United States' },
  '10002': { city: 'New York', state: 'NY', country: 'United States' },
  '10036': { city: 'New York', state: 'NY', country: 'United States' },
  '60601': { city: 'Chicago', state: 'IL', country: 'United States' },
  '60602': { city: 'Chicago', state: 'IL', country: 'United States' },
  '60611': { city: 'Chicago', state: 'IL', country: 'United States' },
  '90001': { city: 'Los Angeles', state: 'CA', country: 'United States' },
  '90210': { city: 'Beverly Hills', state: 'CA', country: 'United States' },
  '94102': { city: 'San Francisco', state: 'CA', country: 'United States' },
  '94103': { city: 'San Francisco', state: 'CA', country: 'United States' },
  '95101': { city: 'San Jose', state: 'CA', country: 'United States' },
  '92101': { city: 'San Diego', state: 'CA', country: 'United States' },
  '77001': { city: 'Houston', state: 'TX', country: 'United States' },
  '75201': { city: 'Dallas', state: 'TX', country: 'United States' },
  '78701': { city: 'Austin', state: 'TX', country: 'United States' },
  '78201': { city: 'San Antonio', state: 'TX', country: 'United States' },
  '76101': { city: 'Fort Worth', state: 'TX', country: 'United States' },
  '85001': { city: 'Phoenix', state: 'AZ', country: 'United States' },
  '85701': { city: 'Tucson', state: 'AZ', country: 'United States' },
  '19101': { city: 'Philadelphia', state: 'PA', country: 'United States' },
  '15201': { city: 'Pittsburgh', state: 'PA', country: 'United States' },
  '02101': { city: 'Boston', state: 'MA', country: 'United States' },
  '02134': { city: 'Boston', state: 'MA', country: 'United States' },
  '98101': { city: 'Seattle', state: 'WA', country: 'United States' },
  '97201': { city: 'Portland', state: 'OR', country: 'United States' },
  '80201': { city: 'Denver', state: 'CO', country: 'United States' },
  '30301': { city: 'Atlanta', state: 'GA', country: 'United States' },
  '33101': { city: 'Miami', state: 'FL', country: 'United States' },
  '32801': { city: 'Orlando', state: 'FL', country: 'United States' },
  '32099': { city: 'Jacksonville', state: 'FL', country: 'United States' },
  '37201': { city: 'Nashville', state: 'TN', country: 'United States' },
  '38101': { city: 'Memphis', state: 'TN', country: 'United States' },
  '28201': { city: 'Charlotte', state: 'NC', country: 'United States' },
  '27601': { city: 'Raleigh', state: 'NC', country: 'United States' },
  '43201': { city: 'Columbus', state: 'OH', country: 'United States' },
  '44101': { city: 'Cleveland', state: 'OH', country: 'United States' },
  '48201': { city: 'Detroit', state: 'MI', country: 'United States' },
  '46201': { city: 'Indianapolis', state: 'IN', country: 'United States' },
  '53201': { city: 'Milwaukee', state: 'WI', country: 'United States' },
  '55401': { city: 'Minneapolis', state: 'MN', country: 'United States' },
  '63101': { city: 'St. Louis', state: 'MO', country: 'United States' },
  '64101': { city: 'Kansas City', state: 'MO', country: 'United States' },
  '73101': { city: 'Oklahoma City', state: 'OK', country: 'United States' },
  '67201': { city: 'Wichita', state: 'KS', country: 'United States' },
  '89101': { city: 'Las Vegas', state: 'NV', country: 'United States' },
  '70112': { city: 'New Orleans', state: 'LA', country: 'United States' },
  '35201': { city: 'Birmingham', state: 'AL', country: 'United States' },
  '85260': { city: 'Scottsdale', state: 'AZ', country: 'United States' },
  '20001': { city: 'Washington', state: 'DC', country: 'United States' },
  '21201': { city: 'Baltimore', state: 'MD', country: 'United States' },
  '23219': { city: 'Richmond', state: 'VA', country: 'United States' },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CLINIC: ClinicProfileFormValues = {
  clinicName: 'Health Telematix Clinic',
  email: 'info@healthtelematix.com',
  phone: '(312) 555-0000',
  tinNumber: '12-3456789',
  npiNumber: '1234567890',
  addressLine1: '123 Medical Center Dr',
  addressLine2: 'Suite 400',
  city: 'Chicago',
  state: 'IL',
  zipCode: '60601',
  country: 'United States',
};

const COUNTRY_OPTIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'India',
  'Germany',
  'France',
  'Mexico',
  'Brazil',
  'Japan',
];

const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
  'DC',
];

const CITIES_BY_STATE: Record<string, string[]> = {
  IL: ['Chicago', 'Springfield', 'Naperville', 'Rockford', 'Joliet', 'Aurora'],
  CA: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Fresno'],
  NY: ['New York', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany'],
  TX: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso'],
  FL: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'St. Petersburg', 'Tallahassee'],
  WA: ['Seattle', 'Spokane', 'Tacoma', 'Bellevue', 'Kirkland', 'Redmond'],
  MA: ['Boston', 'Worcester', 'Cambridge', 'Springfield', 'Lowell', 'Quincy'],
  OH: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton'],
  PA: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton'],
  GA: ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens', 'Sandy Springs'],
  NC: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Cary'],
  MI: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing'],
  CO: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton'],
  AZ: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Tempe'],
  TN: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro'],
  MO: ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence', "Lee's Summit"],
  IN: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers'],
  WI: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton'],
  MN: ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park'],
  OR: ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro', 'Beaverton'],
};

// ─── Schemas ──────────────────────────────────────────────────────────────────

const clinicSchema = z.object({
  clinicName: z.string().min(1, 'Clinic name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Enter a valid 10-digit phone number'),
  tinNumber: z.string().min(9, 'Enter a valid TIN number'),
  npiNumber: z.string().length(10, 'NPI must be exactly 10 digits').regex(/^\d+$/, 'NPI must contain only digits'),
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ViewField({ label, value }: { label: string; value: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">{label}</p>
      <p className="text-[13px] font-medium text-foreground leading-snug">{value}</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClinicProfile(): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  const [clinicData, setClinicData] = useState<ClinicProfileFormValues>(DEFAULT_CLINIC);
  const [clinicDialogOpen, setClinicDialogOpen] = useState(false);

  // ── Clinic form ──
  const form = useForm<ClinicProfileFormValues>({
    resolver: zodResolver(clinicSchema),
    defaultValues: clinicData,
  });
  const isDirty = form.formState.isDirty;

  // Watch ZIP to auto-fill city/state/country
  const watchedZip = form.watch('zipCode');
  useEffect(() => {
    const digits = watchedZip?.replace(/\D/g, '') ?? '';
    if (digits.length === 5) {
      const found = ZIP_LOOKUP[digits];
      if (found) {
        form.setValue('city', found.city, { shouldDirty: true });
        form.setValue('state', found.state, { shouldDirty: true });
        form.setValue('country', found.country, { shouldDirty: true });
      }
    }
  }, [watchedZip, form]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleClinicDialogOpen() {
    form.reset(clinicData);
    setClinicDialogOpen(true);
  }

  function onSubmit(values: ClinicProfileFormValues): void {
    setClinicData(values);
    form.reset(values);
    setClinicDialogOpen(false);
    toast.success('Clinic profile updated successfully');
  }

  return (
    <div className="space-y-4">
      {/* ── Clinic Details card — VIEW MODE ── */}
      <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-[13.5px] font-bold text-foreground">Clinic Profile</h3>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">
              Manage your clinic's details and contact information.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-2 shrink-0" onClick={handleClinicDialogOpen}>
            <Pencil size={13} />
            Edit Clinic Profile
          </Button>
        </div>

        <div className="px-6 py-5 grid grid-cols-2 gap-x-10 gap-y-5">
          {/* Clinic Name with logo */}
          <div className="col-span-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
              {logoSrc ? (
                <img src={logoSrc} alt="Clinic Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Camera size={16} className="text-slate-300" />
              )}
            </div>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-muted-foreground mb-0.5">
                Clinic Name
              </p>
              <p className="text-[13px] font-medium text-foreground leading-snug">{clinicData.clinicName}</p>
            </div>
          </div>

          <ViewField label="Phone Number" value={`+1 ${clinicData.phone}`} />
          <ViewField label="Email Address" value={clinicData.email} />
          <ViewField label="NPI Number" value={clinicData.npiNumber} />
          <ViewField label="TIN Number" value={clinicData.tinNumber} />
          <ViewField label="ZIP Code" value={clinicData.zipCode} />
          <ViewField label="Country" value={clinicData.country} />
          <ViewField label="State" value={clinicData.state} />
          <ViewField label="City" value={clinicData.city} />
          <ViewField label="Address Line 1" value={clinicData.addressLine1 || '—'} />
          <ViewField label="Address Line 2" value={clinicData.addressLine2 || '—'} />
        </div>
      </div>

      {/* ── Edit Clinic Profile Modal ── */}
      <Dialog
        open={clinicDialogOpen}
        onOpenChange={(o) => {
          if (!o) setClinicDialogOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-[680px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
            <DialogTitle className="text-[14px] font-bold">Clinic Details</DialogTitle>
            <p className="text-[12px] text-muted-foreground mt-0.5">Update your clinic's information and branding.</p>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="px-6 py-4 space-y-4">
                {/* Logo upload */}
                <div>
                  <p className="text-[12px] font-medium text-foreground mb-2">
                    Clinic Logo <span className="text-muted-foreground font-normal">(Optional)</span>
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary/50 bg-slate-50 hover:bg-primary/5 flex items-center justify-center transition-colors group shrink-0"
                    >
                      {logoSrc ? (
                        <img src={logoSrc} alt="Clinic Logo" className="w-full h-full object-contain rounded-xl p-1" />
                      ) : (
                        <Camera
                          size={20}
                          className="text-muted-foreground group-hover:text-primary transition-colors"
                        />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                    <div>
                      <p className="text-[12.5px] font-medium text-foreground">Upload clinic logo</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG or SVG (max 2MB)</p>
                    </div>
                  </div>
                </div>

                {/* Clinic Name + Email */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clinicName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[12px]">Clinic Name</FormLabel>
                        <FormControl>
                          <Input className="h-9 text-sm" {...field} />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[12px]">Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" className="h-9 text-sm" {...field} />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Phone + TIN */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[12px]">Phone Number</FormLabel>
                        <FormControl>
                          <div className="flex h-9 rounded-md border border-input bg-background overflow-hidden transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40">
                            <div className="flex items-center gap-1.5 px-3 bg-muted border-r border-border text-sm font-medium select-none shrink-0">
                              🇺🇸 <span className="text-muted-foreground text-[12px]">+1</span>
                            </div>
                            <input
                              type="tel"
                              placeholder="(555) 000-0000"
                              autoComplete="tel"
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
                  <FormField
                    control={form.control}
                    name="tinNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[12px]">TIN Number</FormLabel>
                        <FormControl>
                          <Input
                            disabled
                            className="h-9 text-sm bg-slate-50 cursor-not-allowed select-none"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* NPI Number */}
                <FormField
                  control={form.control}
                  name="npiNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">NPI Number</FormLabel>
                      <FormControl>
                        <Input disabled className="h-9 text-sm bg-slate-50 cursor-not-allowed select-none" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Row: ZIP Code + Country */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[12px]">ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="60601" maxLength={10} className="h-9 text-sm" {...field} />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[12px]">Country</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <select
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                form.setValue('state', '', { shouldDirty: true });
                                form.setValue('city', '', { shouldDirty: true });
                              }}
                              className="w-full h-9 rounded-md border border-input bg-background pl-3 pr-8 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                            >
                              <option value="">Select country</option>
                              {COUNTRY_OPTIONS.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={14}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row: State + City — dropdowns */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[12px]">State</FormLabel>
                        <FormControl>
                          <div className="relative">
                            {form.watch('country') === 'United States' ? (
                              <>
                                <select
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    form.setValue('city', '', { shouldDirty: true });
                                  }}
                                  className="w-full h-9 rounded-md border border-input bg-background pl-3 pr-8 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                                >
                                  <option value="">Select state</option>
                                  {US_STATES.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  size={14}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                />
                              </>
                            ) : (
                              <Input placeholder="State / Province" className="h-9 text-sm" {...field} />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => {
                      const state = form.watch('state');
                      const cities = CITIES_BY_STATE[state] ?? [];
                      const isUs = form.watch('country') === 'United States';
                      return (
                        <FormItem>
                          <FormLabel className="text-[12px]">City</FormLabel>
                          <FormControl>
                            <div className="relative">
                              {isUs && cities.length > 0 ? (
                                <>
                                  <select
                                    {...field}
                                    className="w-full h-9 rounded-md border border-input bg-background pl-3 pr-8 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                                  >
                                    <option value="">Select city</option>
                                    {cities.map((c) => (
                                      <option key={c} value={c}>
                                        {c}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown
                                    size={14}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                  />
                                </>
                              ) : (
                                <Input
                                  placeholder={isUs && !state ? 'Select a state first' : 'City'}
                                  disabled={isUs && !state}
                                  className="h-9 text-sm"
                                  {...field}
                                />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                {/* Address Line 1 */}
                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">Address Line 1</FormLabel>
                      <FormControl>
                        <textarea
                          rows={1}
                          placeholder="Street address, building name..."
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground resize-none outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring placeholder:text-muted-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                {/* Address Line 2 */}
                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">
                        Address Line 2 <span className="text-muted-foreground font-normal">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <textarea
                          rows={1}
                          placeholder="Suite, floor, apartment..."
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground resize-none outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring placeholder:text-muted-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Footer */}
              <DialogFooter className="px-6 py-4 border-t border-slate-100">
                <div className="flex items-center justify-end gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 px-6 text-[13px]"
                    onClick={() => setClinicDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!isDirty} className="h-9 px-6 text-[13px] shadow-xs">
                    Save Clinic Profile
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
