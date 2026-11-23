"use client";
import { AaynaSelect } from "@/components/ui/aayna-select";
import Link from "next/link";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { ActionSpinner } from "@/components/ui/action-spinner";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, ReceiptText, RefreshCw, Search, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { formatAaynaPrice, formatDhakaDate, formatAppointmentDate } from "@/lib/locale";
import "./admin-transactions.css";

type Transaction = { id: string; customerName: string; customerEmail: string; serviceName: string; serviceId: string | null; appointmentId: string; appointmentDate: string; appointmentTime: string; amount: number; currency: string; reference: string; status: string; createdAt: string };
type Ledger = { rows: Transaction[]; total: number; page: number; pages: number; limit: number };
export function AdminTransactions() {
  const [data, setData] = useState<Ledger | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const load = useCallback(async (signal: AbortSignal) => {
    try {
      const params = new URLSearchParams({ page: String(page), status: filter, q: query });
      const response = await fetch(`${API_BASE_URL}/api/admin/transactions?${params}`, { credentials: "include", cache: "no-store", signal });
      const result = await response.json().catch(() => null) as { success?: boolean; message?: string; data?: Ledger } | null;
      if (!response.ok || !result?.success || !result.data || !Array.isArray(result.data.rows)) throw new Error(result?.message || "Unable to load transactions.");
      if (!signal.aborted) { setData(result.data); setError(""); }
    } catch (cause) {
      if (!signal.aborted) { setData(null); setError(cause instanceof Error ? cause.message : "Unable to load transactions."); }
    } finally { if (!signal.aborted) setLoading(false); }
  }, [page, filter, query]);
  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => { if (!controller.signal.aborted) { setLoading(true); void load(controller.signal); } });
    return () => controller.abort();
  }, [load, refresh]);
  function searchLedger(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setPage(1); setQuery(search.trim()); }
  return <section className="aaynaLedger" aria-label="Payment transactions" aria-busy={loading}>
    <div className="aaynaLedger_hero"><div><span className="aaynaLedger_kicker">FINANCIAL RECORDS / 01</span><h2>All Payments</h2><p>A clear record of transactions verified by Stripe. No manual payment edits.</p></div><button type="button" className="aaynaLedger_outline" onClick={() => setRefresh(v => v + 1)} disabled={loading}>{loading ? <ActionSpinner label="Refreshing transactions" size={16} /> : <RefreshCw size={16}/>} {loading ? "Refreshing…" : "Refresh"}</button></div>
    <div className="aaynaLedger_toolbar"><form onSubmit={searchLedger} role="search"><Search size={19}/><input aria-label="Search transactions" placeholder="Customer, email, service or Stripe reference" value={search} maxLength={80} onChange={e => setSearch(e.target.value)}/><button type="submit">Search</button></form><div className="aaynaLedger_select"><AaynaSelect value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}><option value="all">All payments</option><option value="paid">Paid</option><option value="failed">Failed</option></AaynaSelect></div></div>
    <div className="aaynaLedger_meta"><span>{data ? `${data.total} transaction${data.total === 1 ? "" : "s"}` : "Payment ledger"}</span><span>READ ONLY · VERIFIED RECORDS</span></div>
    {!loading && error && <div className="aaynaLedger_error" role="alert">{error} <button type="button" disabled={loading} onClick={() => setRefresh(v => v + 1)}>Retry</button></div>}
    {loading ? <ListSkeleton rows={5} title="Loading transactions" /> : data?.rows.length ? <div className="aaynaLedger_rows">{data.rows.map(item => <article className="aaynaLedger_row" key={item.id}><div className="aaynaLedger_mark"><ReceiptText size={20}/></div><div className="aaynaLedger_identity"><strong>{item.customerName}</strong><small>{item.customerEmail || "Email unavailable"}</small><span>{item.serviceName}</span></div><div className="aaynaLedger_date"><small>Transaction date</small><strong>{item.createdAt ? formatDhakaDate(item.createdAt) : "—"}</strong><small>Appointment: {item.appointmentDate ? formatAppointmentDate(item.appointmentDate) : "—"}</small></div><div className="aaynaLedger_amount"><strong>{item.currency === "BDT" ? formatAaynaPrice(item.amount) : `${item.currency} ${item.amount.toFixed(2)}`}</strong><span className="aaynaLedger_status" data-status={item.status}>{item.status}</span></div><button type="button" className="aaynaLedger_details" onClick={() => setSelected(item)}>Details <ChevronRight size={16}/></button></article>)}</div> : !error && <div className="aaynaLedger_empty"><ReceiptText size={27}/><strong>No transactions found</strong><p>Verified payments will appear here after successful Stripe webhook processing.</p></div>}
    {!loading && data && data.pages > 1 && <div className="aaynaLedger_pager"><span>Page {data.page} of {data.pages}</span><div><button type="button" disabled={loading || page <= 1} onClick={() => setPage(v => v - 1)} aria-label="Previous page"><ChevronLeft size={19}/></button><button type="button" disabled={loading || page >= data.pages} onClick={() => setPage(v => v + 1)} aria-label="Next page"><ChevronRight size={19}/></button></div></div>}
    {selected && <div className="aaynaLedger_overlay" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}><aside className="aaynaLedger_drawer" role="dialog" aria-modal="true" aria-labelledby="ledger-details-title"><button type="button" className="aaynaLedger_close" onClick={() => setSelected(null)} aria-label="Close transaction details"><X size={21}/></button><span className="aaynaLedger_kicker">TRANSACTION DETAILS</span><h2 id="ledger-details-title">Payment record<span>.</span></h2><span className="aaynaLedger_status" data-status={selected.status}>{selected.status}</span><dl>{[["Customer", selected.customerName], ["Email", selected.customerEmail || "—"], ["Service", selected.serviceName], ["Appointment date", selected.appointmentDate ? formatAppointmentDate(selected.appointmentDate) : "—"], ["Appointment time", selected.appointmentTime || "—"], ["Amount", selected.currency === "BDT" ? formatAaynaPrice(selected.amount) : `${selected.currency} ${selected.amount.toFixed(2)}`], ["Currency", selected.currency], ["Transaction date", selected.createdAt ? formatDhakaDate(selected.createdAt) : "—"], ["Stripe session", selected.reference || "—"]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{selected.serviceId && <Link href={`/services/${encodeURIComponent(selected.serviceId)}`} className="aaynaLedger_outline">View service <ExternalLink size={16}/></Link>}<p className="aaynaLedger_notice">Payment status is controlled exclusively by verified Stripe events.</p></aside></div>}
  </section>;
}
