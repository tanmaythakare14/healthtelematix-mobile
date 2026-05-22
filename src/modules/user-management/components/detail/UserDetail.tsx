import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Stethoscope, Pencil, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { LeftNav } from '@/components/layout/LeftNav';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { secureLocalStorage } from '@/utils/secureStorage';
import type { UserDetailData, UserStatus, UserListItem, AddUserFormValues } from '../../@types';
import { USER_BASE_PATH, USER_TYPE_LABEL, USER_LIST_STORAGE_KEY } from '../../constants';
import { parseFullName } from '../../utils';
import { AddUserDialog } from '../form/AddUser';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-teal-100 text-teal-700',
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
];

function getAvatarColor(name: string): string {
  const idx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: UserStatus }): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1 rounded-full border',
        status === 'Active'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
          : status === 'Pending'
            ? 'bg-amber-50 text-amber-700 border-amber-100'
            : 'bg-rose-50 text-rose-700 border-rose-100'
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          status === 'Active' ? 'bg-emerald-500' : status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
        )}
      />
      {status}
    </span>
  );
}

// ─── Type Badge ───────────────────────────────────────────────────────────────

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">{icon}</div>
        <h3 className="text-[12.5px] font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, value, phi }: { label: string; value: string; phi?: boolean }): React.JSX.Element {
  return (
    <div>
      <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em] mb-1">{label}</p>
      <p className="text-[13.5px] text-foreground font-medium" {...(phi ? { 'data-phi': 'true' } : {})}>
        {value || '—'}
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UserDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  // Load all users from encrypted storage, find the one matching the route param
  const allUsers = secureLocalStorage.getItemObject<UserListItem[]>(USER_LIST_STORAGE_KEY) ?? [];
  const found = allUsers.find((u) => u.id === id);

  // Derive UserDetailData from the stored UserListItem
  const user: UserDetailData | null = found ? { ...found, ...parseFullName(found.fullName) } : null;

  // ─── Not-found state ─────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="min-h-screen flex bg-[#FAFAF9]">
        <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />
        <div
          className={cn(
            'flex-1 flex flex-col items-center justify-center gap-3 transition-[margin-left] duration-[220ms] ease-in-out',
            navCollapsed ? 'ml-[60px]' : 'ml-60'
          )}
        >
          <p className="text-sm font-medium text-muted-foreground">User not found.</p>
          <Button variant="outline" size="sm" onClick={() => navigate(USER_BASE_PATH)}>
            Back to User List
          </Button>
        </div>
      </div>
    );
  }

  // ─── Edit handler — persists changes back to storage ─────────────────────────

  function handleEditUser(values: AddUserFormValues): void {
    if (!user) return;

    const currentUsers = secureLocalStorage.getItemObject<UserListItem[]>(USER_LIST_STORAGE_KEY) ?? [];
    const nextUsers = currentUsers.map((u) =>
      u.id === user.id
        ? {
            ...u,
            fullName: `${values.prefix} ${values.firstName} ${values.lastName}`,
            email: values.email,
            phone: values.phone,
            specialty: values.specialty,
            npiNumber: values.npiNumber,
          }
        : u
    );
    try {
      secureLocalStorage.setItemObject(USER_LIST_STORAGE_KEY, nextUsers);
    } catch {
      toast.error('Failed to save changes.');
      return;
    }
    toast.success(`${values.firstName} ${values.lastName}'s details updated`);
    setEditOpen(false);
  }

  function handleDeactivate(): void {
    if (!user) return;
    const currentUsers = secureLocalStorage.getItemObject<UserListItem[]>(USER_LIST_STORAGE_KEY) ?? [];
    const nextUsers = currentUsers.map((u) => (u.id === user.id ? { ...u, status: 'Deactivated' as UserStatus } : u));
    try {
      secureLocalStorage.setItemObject(USER_LIST_STORAGE_KEY, nextUsers);
    } catch {
      toast.error('Failed to deactivate user.');
      return;
    }
    toast.success(`${user.fullName} has been deactivated.`);
    navigate(USER_BASE_PATH);
  }

  return (
    <div className="min-h-screen flex bg-[#FAFAF9]">
      <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[margin-left] duration-[220ms] ease-in-out',
          navCollapsed ? 'ml-[60px]' : 'ml-60'
        )}
      >
        <TopBar title="User Management" subtitle="User Details" />

        <main className="flex-1 p-7 flex flex-col gap-5">
          {/* Back link */}
          <button
            type="button"
            onClick={() => navigate(USER_BASE_PATH)}
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft size={14} />
            Back to User List
          </button>

          {/* Profile header card */}
          <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              {/* Left — avatar + name + contact */}
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold shrink-0',
                    getAvatarColor(user.fullName)
                  )}
                >
                  {getInitials(user.fullName)}
                </div>
                <div className="min-w-0">
                  <h1 className="text-[17px] font-bold text-foreground tracking-tight leading-snug mb-1.5">
                    {user.fullName}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground" data-phi>
                      <Mail size={12} className="shrink-0" />
                      {user.email}
                    </span>
                    <span className="text-slate-300 text-[11px]">·</span>
                    <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground" data-phi>
                      <Phone size={12} className="shrink-0" />
                      {user.phone}
                    </span>
                    <span className="text-slate-300 text-[11px]">·</span>
                    <StatusBadge status={user.status} />
                  </div>
                </div>
              </div>

              {/* Right — edit + deactivate */}
              <div className="flex items-center gap-3 shrink-0">
                {user.status !== 'Deactivated' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 text-sm gap-2"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil size={13} />
                    Edit
                  </Button>
                )}
                {user.addedBy === 'you' && user.type === 'PHYSICIAN' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3.5 gap-1.5 text-[12px] font-medium inline-flex items-center text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-400"
                    onClick={() => setDeactivateOpen(true)}
                  >
                    <PowerOff size={13} className="shrink-0" />
                    Deactivate
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <SectionCard icon={<Stethoscope size={15} className="text-primary" />} title="Professional Details">
            <div className="px-6 py-5 grid grid-cols-2 gap-x-10 gap-y-5">
              <Field label="NPI Number" value={user.npiNumber} />
              <Field label="Specialty" value={user.specialty} />
              <Field label="User Type" value={USER_TYPE_LABEL[user.type]} />
            </div>
          </SectionCard>
        </main>
      </div>

      {/* Edit Dialog */}
      <AddUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        defaultValues={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          specialty: user.specialty,
          npiNumber: user.npiNumber,
          type: user.type,
        }}
        onSubmit={handleEditUser}
      />

      {/* Deactivate Confirmation Dialog */}
      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        icon={<PowerOff size={20} />}
        iconClassName="bg-rose-50 text-rose-500"
        title="Deactivate User"
        description={
          <>
            Are you sure you want to deactivate{' '}
            <span className="font-semibold text-foreground" data-phi="true">
              {user.fullName}
            </span>
            ? They will lose access to the portal immediately.
          </>
        }
        confirmLabel="Deactivate"
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
