import React from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HelpAndSupport(): React.JSX.Element {
  return (
    <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-[13.5px] font-bold text-foreground">Contact Super Admin</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          For urgent issues, you can send a direct email to the Super Admin.
        </p>
      </div>

      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Mail size={15} className="text-primary" />
          </div>
          <div>
            <p className="text-[12.5px] font-semibold text-foreground">Super Admin</p>
            <p className="text-[12px] text-muted-foreground">admin@healthtelematix.com</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            window.location.href = 'mailto:admin@healthtelematix.com';
          }}
        >
          <Mail size={13} />
          Send Email
        </Button>
      </div>
    </div>
  );
}
