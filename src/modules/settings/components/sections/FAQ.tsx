import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    id: 'q1',
    question: 'How do I enroll a new patient?',
    answer:
      'Navigate to Patient Management from the left sidebar and click "Enroll New Patient". Complete the 5-step enrollment form covering demographics, insurance, emergency contact, clinical details, and consent. Once submitted, the patient will appear in your patient list.',
  },
  {
    id: 'q2',
    question: 'How do I add a new physician to my clinic?',
    answer:
      'Go to User Management and click "Add New Physician". Fill in the physician\'s details including their name, email, phone number, NPI number, and specialty. Toggle "Send Invite" to automatically email them a login link.',
  },
  {
    id: 'q3',
    question: 'What is the difference between APCM and RPM?',
    answer:
      'APCM (Advanced Primary Care Management) is a care coordination program focused on chronic condition management through regular check-ins and care planning. RPM (Remote Patient Monitoring) involves the use of connected devices to continuously track patient vitals like blood pressure, glucose, and heart rate.',
  },
  {
    id: 'q4',
    question: "How do I view a patient's vitals history?",
    answer:
      'Open a patient\'s detail page from the Patient Management list, then select the "Vitals" tab. You can filter by time range (24h, 7d, 30d, 90d) and by vital type (Blood Pressure, Heart Rate, Weight, Glucose). Trend charts and a history table are both available.',
  },
  {
    id: 'q5',
    question: 'How do I change my account password?',
    answer:
      'Go to Settings → Change Password. Enter your current password, followed by your new password twice. Your new password must be at least 8 characters and include one uppercase letter and one number.',
  },
  {
    id: 'q6',
    question: 'Can I edit clinic information after onboarding?',
    answer:
      'Yes. Go to Settings → Clinic Profile. You can update the clinic name, email, phone number, physical address, TIN number, and clinic logo at any time. Note that the Clinic Admin Name, Admin Email, and NPI Number are non-editable and managed by the Super Admin.',
  },
  {
    id: 'q7',
    question: 'What should I do if a physician is no longer with the clinic?',
    answer:
      'Go to User Management, find the physician you added (rows with a pencil icon under "Action"), and click the edit icon. You can update their status or contact Super Admin to deactivate the account if it was created by them.',
  },
  {
    id: 'q8',
    question: 'How do I contact support?',
    answer:
      'Go to Settings → Help & Support. You can submit a query directly from the portal or send an email to the Super Admin. Our support team typically responds within 1 business day.',
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  return (
    <div className={cn('border-b border-slate-100 last:border-0')}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50/60 transition-colors gap-4"
      >
        <span className="text-[13px] font-semibold text-foreground">{question}</span>
        {isOpen ? (
          <ChevronUp size={14} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-muted-foreground shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-5">
          <p className="text-[12.5px] text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FAQ(): React.JSX.Element {
  const [openId, setOpenId] = useState<string | null>('q1');

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-[13.5px] font-bold text-foreground">Frequently Asked Questions</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Answers to common questions about using the clinic portal.
        </p>
      </div>

      <div>
        {FAQS.map((faq) => (
          <FAQItem
            key={faq.id}
            question={faq.question}
            answer={faq.answer}
            isOpen={openId === faq.id}
            onToggle={() => toggle(faq.id)}
          />
        ))}
      </div>
    </div>
  );
}
