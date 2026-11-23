"use client";

import { AaynaSelect } from "@/components/ui/aayna-select";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { ActionSpinner } from "@/components/ui/action-spinner";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Ban, Check, ChevronRight, RefreshCw, Search, ShieldCheck, UserRound, UsersRound, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { notify } from "@/lib/notifications";
import { formatDhakaDate } from "@/lib/locale";
import "./admin-users.css";

type Customer = { id: string; name: string; email: string; image: string | null; phone: string | null; joinedAt: string; isBlocked: boolean; appointmentCount: number; emailVerified?: boolean };
type Directory = { users: Customer[]; total: number; page: number; pages: number };
type Filter = "all" | "active" | "blocked";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, { credentials: "include", cache: "no-store", ...options });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) throw new Error(body?.message || `Request failed (HTTP ${response.status}).`);
  return body.data as T;
}

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Directory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirm, setConfirm] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const handle = window.setTimeout(() => { setPage(1); setQuery(search.trim()); }, 300);
    return () => window.clearTimeout(handle);
  }, [search]);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const result = await request<Directory>(`/api/admin/users?search=${encodeURIComponent(query)}&status=${filter}&page=${page}`, { signal: controller.signal });
        if (!controller.signal.aborted) { setData(result); setError(""); setLoading(false); }
      } catch (cause) {
        if (!controller.signal.aborted) { setError(cause instanceof Error ? cause.message : "Unable to load customers."); setLoading(false); }
      }
    }
    queueMicrotask(() => { if (!controller.signal.aborted) { setLoading(true); void load(); } });
    return () => controller.abort();
  }, [query, filter, page, revision]);

  async function openDetails(customer: Customer) {
    setSelected(customer); setActionError(""); setDetailLoading(true);
    try { const detail = await request<Customer>(`/api/admin/users/${encodeURIComponent(customer.id)}`); setSelected((previous) => previous?.id === detail.id ? detail : previous); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : "Could not load customer details."); }
    finally { setDetailLoading(false); }
  }
  async function updateAccess() {
    if (!confirm || saving) return;
    setSaving(true); setActionError("");
    try {
      const next = !confirm.isBlocked;
      await request<{ id: string; isBlocked: boolean }>(`/api/admin/users/${encodeURIComponent(confirm.id)}/block`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isBlocked: next }) });
      setSelected((previous) => previous?.id === confirm.id ? { ...previous, isBlocked: next } : previous);
      setConfirm(null); notify.success(next ? "Customer access blocked." : "Customer access restored."); reload();
    } catch (cause) { const message = cause instanceof Error ? cause.message : "Could not update customer access."; setActionError(message); notify.error(message); }
    finally { setSaving(false); }
  }

  return <section className="aaynaUsers" aria-label="Customer directory">
    <div className="aaynaUsers_intro"><div><span className="aaynaUsers_kicker">PEOPLE / 01</span><h2>Every customer.<br/><em>Clearly connected.</em></h2><p>Understand your community and manage account access with care.</p></div><div className="aaynaUsers_total"><strong>{data?.total ?? "—"}</strong><span>Matching customers</span></div></div>
    <div className="aaynaUsers_toolbar"><label className="aaynaUsers_search"><Search size={19}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" aria-label="Search customers" /></label><label className="aaynaUsers_select"><span>Account status</span><AaynaSelect value={filter} onChange={(event) => { setFilter(event.target.value as Filter); setPage(1); }}><option value="all">All accounts</option><option value="active">Active</option><option value="blocked">Blocked</option></AaynaSelect></label><button className="aaynaUsers_refresh" type="button" onClick={reload} disabled={loading} aria-label="Refresh customers"><RefreshCw size={19}/></button></div>
    {error && <div className="aaynaUsers_error" role="alert">{error} <button type="button" onClick={reload}>Retry</button></div>}
    <div className="aaynaUsers_list"><div className="aaynaUsers_header"><span>Customer</span><span>Joined</span><span>Appointments</span><span>Access</span><span></span></div>
      {loading ? <ListSkeleton rows={6} title="Loading customer accounts" /> : !data?.users.length ? <div className="aaynaUsers_empty"><UsersRound size={30}/><strong>No customers found</strong><span>Try another search or account filter.</span></div> : data.users.map((customer) => <article key={customer.id} className="aaynaUsers_row"><div className="aaynaUsers_person"><div className="aaynaUsers_avatar" aria-hidden="true">{customer.name.slice(0, 1).toUpperCase() || <UserRound size={18}/>}</div><div><strong>{customer.name}</strong><small>{customer.email}</small></div></div><div className="aaynaUsers_joined"><span className="aaynaUsers_mobileLabel">Joined</span>{customer.joinedAt ? formatDhakaDate(customer.joinedAt) : "—"}</div><div className="aaynaUsers_count"><span className="aaynaUsers_mobileLabel">Bookings</span>{customer.appointmentCount}</div><div><span className="aaynaUsers_status" data-blocked={customer.isBlocked}>{customer.isBlocked ? "Blocked" : "Active"}</span></div><button type="button" className="aaynaUsers_view" onClick={() => void openDetails(customer)}>View <ChevronRight size={16}/></button></article>)}
    </div>
    {data && data.pages > 1 && <div className="aaynaUsers_pagination"><span>Page {data.page} of {data.pages}</span><div><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} aria-label="Previous page"><ArrowLeft size={18}/></button><button type="button" disabled={page >= data.pages || loading} onClick={() => setPage((value) => value + 1)} aria-label="Next page"><ArrowRight size={18}/></button></div></div>}
    {selected && <div className="aaynaUsers_backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !confirm) setSelected(null); }}><section className="aaynaUsers_panel" role="dialog" aria-modal="true" aria-labelledby="aayna-user-title"><button className="aaynaUsers_close" type="button" onClick={() => setSelected(null)} aria-label="Close customer details"><X size={21}/></button><span className="aaynaUsers_kicker">CUSTOMER PROFILE</span><div className="aaynaUsers_profile"><div className="aaynaUsers_bigAvatar">{selected.name.slice(0, 1).toUpperCase()}</div><h2 id="aayna-user-title">{selected.name}</h2><span className="aaynaUsers_status" data-blocked={selected.isBlocked}>{selected.isBlocked ? "Blocked" : "Active account"}</span></div>{detailLoading && <p role="status" aria-live="polite"><ActionSpinner label="Loading customer details" /> Refreshing customer details…</p>}<dl className="aaynaUsers_details">{[["Email", selected.email], ["Phone", selected.phone || "Not provided"], ["Joined", selected.joinedAt ? formatDhakaDate(selected.joinedAt) : "—"], ["Appointments", String(selected.appointmentCount)], ["Email verified", selected.emailVerified === undefined ? "—" : selected.emailVerified ? "Yes" : "No"], ["Customer reference", selected.id]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{actionError && <p className="aaynaUsers_error" role="alert">{actionError}</p>}<button className="aaynaUsers_access" data-blocked={selected.isBlocked} type="button" onClick={() => { setActionError(""); setConfirm(selected); }}>{selected.isBlocked ? <ShieldCheck size={18}/> : <Ban size={18}/>} {selected.isBlocked ? "Restore account access" : "Block customer access"}</button><p className="aaynaUsers_note">Account restrictions are enforced on protected server routes.</p></section></div>}
    {confirm && <div className="aaynaUsers_backdrop aaynaUsers_confirmation"><section className="aaynaUsers_dialog" role="alertdialog" aria-modal="true" aria-labelledby="aayna-user-confirm-title"><div className="aaynaUsers_dialogIcon">{confirm.isBlocked ? <Check size={22}/> : <Ban size={22}/>}</div><h2 id="aayna-user-confirm-title">{confirm.isBlocked ? "Restore access?" : "Block this account?"}</h2><p>{confirm.isBlocked ? `${confirm.name} will be able to sign in and use protected Aayna features again.` : `${confirm.name} will lose access to protected features, and their active sessions will be revoked.`}</p>{actionError && <p className="aaynaUsers_error" role="alert">{actionError}</p>}<div className="aaynaUsers_dialogActions"><button type="button" disabled={saving} onClick={() => { setConfirm(null); setActionError(""); }}>Keep current status</button><button type="button" disabled={saving} onClick={() => void updateAccess()}>{saving ? <><ActionSpinner label="Updating customer access" /> Updating…</> : confirm.isBlocked ? "Restore access" : "Block account"}</button></div></section></div>}
  </section>;
}
