import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Filter, Pencil, PowerOff, Send, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/search-input/SearchInput';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { LeftNav } from '@/components/layout/LeftNav';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';
import { StatusTabs } from '@/components/status-tabs';
import { secureLocalStorage } from '@/utils/secureStorage';
import type { UserListItem, UserType, UserStatus, AddUserFormValues } from '../../@types';
import {
  USER_BASE_PATH,
  USER_TYPE_LABEL,
  USER_TYPE_OPTIONS,
  USER_LIST_STORAGE_KEY,
  USER_SEED_KEY,
  DUMMY_USERS,
} from '../../constants';
import { parseFullName } from '../../utils';
import { AddUserDialog } from '../form/AddUser';

// --- Helpers -----------------------------------------------------------------

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

// --- Persistence --------------------------------------------------------------

function persistUsers(list: UserListItem[]): void {
  try {
    secureLocalStorage.setItemObject(USER_LIST_STORAGE_KEY, list);
  } catch {
    toast.error('Failed to save user data. Changes may not persist after refresh.');
  }
}

// --- Component ----------------------------------------------------------------

export function UserList(): React.JSX.Element {
  const navigate = useNavigate();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus>('Active');
  const [typeFilter, setTypeFilter] = useState<'All' | UserType>('All');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [addedByFilter, setAddedByFilter] = useState<'All' | 'superadmin' | 'you'>('All');
  const [addedByDropdownOpen, setAddedByDropdownOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<UserListItem | null>(null);

  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const addedByDropdownRef = useRef<HTMLDivElement>(null);

  // Seed dummy data once on first load
  const [users, setUsers] = useState<UserListItem[]>(() => {
    const alreadySeeded = secureLocalStorage.getItemObject<boolean>(USER_SEED_KEY);
    if (!alreadySeeded) {
      secureLocalStorage.setItemObject(USER_LIST_STORAGE_KEY, DUMMY_USERS);
      secureLocalStorage.setItemObject(USER_SEED_KEY, true);
      return DUMMY_USERS;
    }
    const stored = secureLocalStorage.getItemObject<UserListItem[]>(USER_LIST_STORAGE_KEY) ?? [];
    // Ensure non-PHYSICIAN users are never marked as added by clinic admin
    const corrected = stored.map((u) =>
      u.type !== 'PHYSICIAN' && u.addedBy === 'you' ? { ...u, addedBy: 'superadmin' as const } : u
    );
    secureLocalStorage.setItemObject(USER_LIST_STORAGE_KEY, corrected);
    return corrected;
  });

  // Close dropdowns on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
      if (addedByDropdownRef.current && !addedByDropdownRef.current.contains(e.target as Node)) {
        setAddedByDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const columns = useMemo<ColumnDef<UserListItem>[]>(() => {
    const isDeactivatedTab = statusFilter === 'Deactivated';
    const isPendingTab = statusFilter === 'Pending';
    return [
      {
        accessorKey: 'fullName',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                isDeactivatedTab ? 'bg-slate-100 text-slate-400' : getAvatarColor(row.original.fullName)
              )}
            >
              {getInitials(row.original.fullName)}
            </div>
            <span
              className={cn(
                'text-[13.5px] font-semibold leading-tight',
                isDeactivatedTab ? 'text-muted-foreground' : 'text-foreground'
              )}
            >
              {row.original.fullName}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email Address',
        cell: ({ row }) => (
          <span className="text-[13px] text-muted-foreground" data-phi="true">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone Number',
        cell: ({ row }) => (
          <span className="text-[13px] text-foreground" data-phi="true">
            {row.original.phone}
          </span>
        ),
      },
      {
        accessorKey: 'npiNumber',
        header: 'NPI Number',
        cell: ({ row }) => <span className="text-[13px] text-foreground">{row.original.npiNumber || '—'}</span>,
      },
      {
        accessorKey: 'type',
        header: 'User Type',
        cell: ({ row }) => {
          const typeStyles: Record<UserType, string> = {
            PHYSICIAN: 'bg-violet-50 text-violet-700 border-violet-100',
            NURSE: 'bg-blue-50 text-blue-700 border-blue-100',
            DHN: 'bg-teal-50 text-teal-700 border-teal-100',
          };
          return (
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                typeStyles[row.original.type]
              )}
            >
              {USER_TYPE_LABEL[row.original.type]}
            </span>
          );
        },
      },
      {
        accessorKey: 'specialty',
        header: 'Specialty',
        cell: ({ row }) => <span className="text-[13px] text-foreground">{row.original.specialty || '—'}</span>,
      },
      {
        id: 'addedBy',
        header: 'Added By',
        cell: ({ row }) => (
          <span className="text-[13px] text-muted-foreground">
            {row.original.addedBy === 'you' ? 'You' : 'Super Admin'}
          </span>
        ),
      },
      ...(isDeactivatedTab
        ? [
            {
              id: 'deactivatedOn',
              header: 'Deactivated On',
              cell: ({ row }: { row: { original: UserListItem } }) => (
                <span className="text-[13px] text-muted-foreground">{row.original.deactivatedOn ?? '—'}</span>
              ),
            } satisfies ColumnDef<UserListItem>,
          ]
        : []),
      ...(!isDeactivatedTab
        ? [
            {
              id: 'actions',
              header: 'Action',
              cell: ({ row }: { row: { original: UserListItem } }) => {
                if (isPendingTab) {
                  return (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        title="Resend invite"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success(`Invite resent to ${row.original.email}`);
                        }}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
                      >
                        <Send size={13} />
                      </button>
                    </div>
                  );
                }
                const { addedBy, type } = row.original;
                if (addedBy !== 'you' || type !== 'PHYSICIAN') return null;
                return (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      title="Edit physician"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingUser(row.original);
                      }}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      title="Deactivate user"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeactivatingUser(row.original);
                      }}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <PowerOff size={13} />
                    </button>
                  </div>
                );
              },
            } satisfies ColumnDef<UserListItem>,
          ]
        : []),
    ];
  }, [statusFilter]);

  const filteredData = useMemo(
    () =>
      users.filter((u) => {
        const q = search.toLowerCase();
        const matchesSearch = !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        if (!matchesSearch) return false;
        if (u.status !== statusFilter) return false;
        if (typeFilter !== 'All' && u.type !== typeFilter) return false;
        if (addedByFilter !== 'All' && u.addedBy !== addedByFilter) return false;
        return true;
      }),
    [search, statusFilter, typeFilter, addedByFilter, users]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
    autoResetPageIndex: true,
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const total = filteredData.length;
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, total);

  function handleAddUser(values: AddUserFormValues): void {
    const newUser: UserListItem = {
      id: `u-${Date.now()}`,
      fullName: `${values.prefix} ${values.firstName} ${values.lastName}`,
      email: values.email,
      phone: values.phone,
      npiNumber: values.npiNumber,
      specialty: values.specialty,
      type: 'PHYSICIAN',
      status: 'Pending',
      addedBy: 'you',
    };
    const nextUsers = [newUser, ...users];
    setUsers(nextUsers);
    persistUsers(nextUsers);
  }

  function handleEditUser(values: AddUserFormValues): void {
    if (!editingUser) return;
    const updated: UserListItem = {
      ...editingUser,
      fullName: `${values.prefix} ${values.firstName} ${values.lastName}`,
      email: values.email,
      phone: values.phone,
      specialty: values.specialty,
      npiNumber: values.npiNumber,
    };
    const nextUsers = users.map((u) => (u.id === editingUser.id ? updated : u));
    setUsers(nextUsers);
    persistUsers(nextUsers);
    toast.success(`${values.firstName} ${values.lastName}'s details updated`);
    setEditingUser(null);
  }

  function confirmDeactivate(): void {
    if (!deactivatingUser) return;
    const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const nextUsers = users.map((u) =>
      u.id === deactivatingUser.id ? { ...u, status: 'Deactivated' as const, deactivatedOn: today } : u
    );
    setUsers(nextUsers);
    persistUsers(nextUsers);
    setDeactivatingUser(null);
    toast.success(`${deactivatingUser.fullName} has been deactivated.`);
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
        <TopBar title="User Management" subtitle="Manage physicians, nurses, and digital health navigators" />

        <main className="flex-1 p-7 flex flex-col gap-5">
          {/* Controls row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {/* Status filter tabs */}
              <StatusTabs
                tabs={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Deactivated', label: 'Deactivated' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
              />

              {/* Search */}
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by name or email..."
                className="w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* User Type filter dropdown */}
              <div ref={typeDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setTypeDropdownOpen((o) => !o)}
                  className={cn(
                    'h-9 px-3.5 flex items-center gap-2 rounded-lg border text-sm font-medium transition-colors',
                    typeFilter !== 'All'
                      ? 'border-primary/40 bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white text-foreground hover:bg-slate-50'
                  )}
                >
                  <Filter size={13} />
                  {typeFilter === 'All' ? 'User Type' : USER_TYPE_LABEL[typeFilter]}
                  <ChevronDown
                    size={13}
                    className={cn(
                      'text-muted-foreground transition-transform duration-150',
                      typeDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {typeDropdownOpen && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-52 bg-white rounded-xl border border-slate-200 shadow-xs py-1.5 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setTypeFilter('All');
                        setTypeDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3.5 py-2.5 text-[13px] font-medium transition-colors text-left',
                        typeFilter === 'All' ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-slate-50'
                      )}
                    >
                      All Types
                      {typeFilter === 'All' && <Check size={13} className="text-primary shrink-0" />}
                    </button>
                    {USER_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setTypeFilter(opt.value);
                          setTypeDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-3.5 py-2.5 text-[13px] font-medium transition-colors text-left',
                          typeFilter === opt.value ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-slate-50'
                        )}
                      >
                        {opt.label}
                        {typeFilter === opt.value && <Check size={13} className="text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Added By filter dropdown */}
              <div ref={addedByDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAddedByDropdownOpen((o) => !o)}
                  className={cn(
                    'h-9 px-3.5 flex items-center gap-2 rounded-lg border text-sm font-medium transition-colors',
                    addedByFilter !== 'All'
                      ? 'border-primary/40 bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white text-foreground hover:bg-slate-50'
                  )}
                >
                  <Filter size={13} />
                  {addedByFilter === 'All' ? 'Added By' : addedByFilter === 'you' ? 'You' : 'Super Admin'}
                  <ChevronDown
                    size={13}
                    className={cn(
                      'text-muted-foreground transition-transform duration-150',
                      addedByDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {addedByDropdownOpen && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-44 bg-white rounded-xl border border-slate-200 shadow-xs py-1.5 overflow-hidden">
                    {(
                      [
                        { value: 'All', label: 'All' },
                        { value: 'superadmin', label: 'Super Admin' },
                        { value: 'you', label: 'You' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setAddedByFilter(opt.value);
                          setAddedByDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-3.5 py-2.5 text-[13px] font-medium transition-colors text-left',
                          addedByFilter === opt.value
                            ? 'bg-primary/5 text-primary'
                            : 'text-foreground hover:bg-slate-50'
                        )}
                      >
                        {opt.label}
                        {addedByFilter === opt.value && <Check size={13} className="text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Physician CTA */}
              <Button className="h-9 px-4 text-sm font-semibold gap-2 shadow-xs" onClick={() => setAddOpen(true)}>
                <UserPlus size={15} />
                Add New Physician
              </Button>
            </div>
          </div>

          {/* Table card */}
          <div className="bg-white border border-slate-200 rounded-[14px] shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-[#FAFAF9] hover:bg-[#FAFAF9] border-b border-slate-200">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground py-3.5 first:pl-5"
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={columns.length} className="py-0">
                      {users.filter((u) => u.status === statusFilter).length === 0 ? (
                        /* -- True empty state -- */
                        <div className="flex flex-col items-center justify-center py-16 gap-5">
                          <svg
                            width="148"
                            height="148"
                            viewBox="0 0 148 148"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <circle cx="74" cy="74" r="74" fill="#F0FDFA" />
                            <circle cx="74" cy="74" r="58" stroke="#CCFBF1" strokeWidth="1.5" strokeDasharray="4 3" />
                            <rect
                              x="42"
                              y="38"
                              width="64"
                              height="76"
                              rx="10"
                              fill="white"
                              stroke="#99F6E4"
                              strokeWidth="1.5"
                            />
                            <rect
                              x="60"
                              y="33"
                              width="28"
                              height="10"
                              rx="5"
                              fill="#CCFBF1"
                              stroke="#5EEAD4"
                              strokeWidth="1.5"
                            />
                            <circle cx="74" cy="67" r="10" fill="#CCFBF1" stroke="#2DD4BF" strokeWidth="1.5" />
                            <path
                              d="M55 95c0-10.493 8.507-19 19-19s19 8.507 19 19"
                              stroke="#2DD4BF"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              fill="#E0FDF4"
                            />
                            <circle cx="99" cy="99" r="14" fill="#0D9488" />
                            <line
                              x1="99"
                              y1="93"
                              x2="99"
                              y2="105"
                              stroke="white"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                            />
                            <line
                              x1="93"
                              y1="99"
                              x2="105"
                              y2="99"
                              stroke="white"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="text-center space-y-1.5">
                            <p className="text-[14.5px] font-bold text-foreground">No {statusFilter} Users</p>
                            <p className="text-[12.5px] text-muted-foreground max-w-[260px] leading-relaxed">
                              {statusFilter === 'Active'
                                ? 'Add your first physician using the Add New Physician button above.'
                                : statusFilter === 'Pending'
                                  ? 'No users are currently pending activation.'
                                  : 'Users you deactivate will appear here.'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* -- Filtered empty state -- */
                        <div className="flex flex-col items-center justify-center py-14 gap-4">
                          <svg
                            width="72"
                            height="72"
                            viewBox="0 0 72 72"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <circle cx="36" cy="36" r="36" fill="#F8FAFC" />
                            <circle cx="33" cy="32" r="13" stroke="#CBD5E1" strokeWidth="2" />
                            <line
                              x1="42.5"
                              y1="42.5"
                              x2="52"
                              y2="52"
                              stroke="#CBD5E1"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                            <line
                              x1="29"
                              y1="28"
                              x2="37"
                              y2="36"
                              stroke="#CBD5E1"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                            <line
                              x1="37"
                              y1="28"
                              x2="29"
                              y2="36"
                              stroke="#CBD5E1"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="text-center space-y-1">
                            <p className="text-[13.5px] font-semibold text-foreground">No results found</p>
                            <p className="text-[12px] text-muted-foreground">
                              Try adjusting your search or filter criteria.
                            </p>
                          </div>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-0"
                      onClick={() => navigate(`${USER_BASE_PATH}/${row.original.id}`)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3.5 first:pl-5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {total > 0 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                <p className="text-xs text-muted-foreground">
                  Showing{' '}
                  <span className="font-semibold text-foreground">
                    {from}–{to}
                  </span>{' '}
                  of <span className="font-semibold text-foreground">{total}</span> users
                </p>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft size={14} />
                  </Button>

                  {Array.from({ length: table.getPageCount() }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => table.setPageIndex(i)}
                      className={cn(
                        'w-8 h-8 rounded-md text-xs font-medium transition-colors',
                        pageIndex === i
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-slate-100'
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Physician dialog */}
      <AddUserDialog open={addOpen} onOpenChange={setAddOpen} mode="add" onSubmit={handleAddUser} />

      {/* Edit user dialog */}
      {editingUser && (
        <AddUserDialog
          open={!!editingUser}
          onOpenChange={(open) => {
            if (!open) setEditingUser(null);
          }}
          mode="edit"
          defaultValues={{
            ...parseFullName(editingUser.fullName),
            email: editingUser.email,
            phone: editingUser.phone,
            specialty: editingUser.specialty,
            npiNumber: editingUser.npiNumber,
            type: editingUser.type,
          }}
          onSubmit={handleEditUser}
        />
      )}

      {/* Deactivate confirmation */}
      <ConfirmDialog
        open={!!deactivatingUser}
        onOpenChange={(o) => {
          if (!o) setDeactivatingUser(null);
        }}
        icon={<PowerOff size={18} className="text-amber-600" />}
        iconClassName="bg-amber-50 text-amber-600"
        title="Deactivate User"
        description={
          <>
            Are you sure you want to deactivate{' '}
            <span className="font-semibold text-foreground">{deactivatingUser?.fullName}</span>? They will be moved to
            the Deactivated tab and will no longer have access to the portal.
          </>
        }
        confirmLabel="Deactivate User"
        confirmClassName="bg-amber-600 text-white hover:bg-amber-700"
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
