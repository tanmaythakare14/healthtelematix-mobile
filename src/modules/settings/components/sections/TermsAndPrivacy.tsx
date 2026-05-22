import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function PolicySection({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}): React.JSX.Element {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors text-left"
      >
        <div>
          <h3 className="text-[13.5px] font-bold text-foreground">{title}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Last updated: {lastUpdated}</p>
        </div>
        {open ? (
          <ChevronUp size={15} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown size={15} className="text-muted-foreground shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-slate-100 space-y-4 text-[13px] text-muted-foreground leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

function PolicyHeading({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <h4 className={cn('text-[12.5px] font-bold text-foreground mt-5 mb-1.5')}>{children}</h4>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TermsAndPrivacy(): React.JSX.Element {
  return (
    <div className="space-y-4">
      {/* Terms of Service */}
      <PolicySection title="Terms of Service" lastUpdated="January 1, 2026">
        <PolicyHeading>1. Acceptance of Terms</PolicyHeading>
        <p>
          By accessing or using the Health Telematix Clinic Portal, you agree to be bound by these Terms of Service. If
          you do not agree to all terms, you may not access or use the portal.
        </p>

        <PolicyHeading>2. Authorized Use</PolicyHeading>
        <p>
          This portal is intended solely for authorized healthcare professionals. Users must maintain valid credentials
          and must not share access with unauthorized individuals. Any misuse of patient data is strictly prohibited
          under HIPAA regulations.
        </p>

        <PolicyHeading>3. Data Accuracy</PolicyHeading>
        <p>
          Clinic Admins and care team members are responsible for ensuring the accuracy of data entered into the system.
          Health Telematix is not liable for clinical decisions made based on inaccurate or incomplete information.
        </p>

        <PolicyHeading>4. System Availability</PolicyHeading>
        <p>
          Health Telematix strives to maintain 99.9% uptime but does not guarantee uninterrupted access. Scheduled
          maintenance will be communicated at least 48 hours in advance.
        </p>

        <PolicyHeading>5. Termination</PolicyHeading>
        <p>
          Health Telematix reserves the right to suspend or terminate access to the portal at any time for violation of
          these terms, without prior notice.
        </p>
      </PolicySection>

      {/* Privacy Policy */}
      <PolicySection title="Privacy Policy" lastUpdated="January 1, 2026">
        <PolicyHeading>1. Information We Collect</PolicyHeading>
        <p>
          We collect information necessary to operate the clinic portal, including user account details, clinic
          information, and de-identified aggregate usage analytics. Patient health information (PHI) is processed in
          accordance with HIPAA.
        </p>

        <PolicyHeading>2. How We Use Your Information</PolicyHeading>
        <p>
          Information is used solely to provide the Health Telematix services, improve platform functionality, and
          comply with legal obligations. We do not sell or share personal information with third parties for marketing
          purposes.
        </p>

        <PolicyHeading>3. Data Security</PolicyHeading>
        <p>
          All data is encrypted at rest and in transit using AES-256 and TLS 1.3 respectively. Access to patient data is
          role-based and audited. We maintain a comprehensive Business Associate Agreement (BAA) with all covered
          entities.
        </p>

        <PolicyHeading>4. Data Retention</PolicyHeading>
        <p>
          Patient data is retained for a minimum of 7 years in accordance with federal and state regulations. Upon
          account termination, clinic data will be exported and deleted within 30 days.
        </p>

        <PolicyHeading>5. Contact</PolicyHeading>
        <p>
          For privacy-related inquiries, contact our Data Protection Officer at{' '}
          <span className="font-medium text-primary">privacy@healthtelematix.com</span>.
        </p>
      </PolicySection>
    </div>
  );
}
