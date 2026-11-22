"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight, CircleUserRound, LayoutGrid, LogOut, Menu, Moon, Scissors, Sun, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { API_BASE_URL } from "@/lib/api";
const styles = {
  avatar: "aaynaDash_avatar",
  close: "aaynaDash_close",
  content: "aaynaDash_content",
  dot: "aaynaDash_dot",
  error: "aaynaDash_error",
  external: "aaynaDash_external",
  eyebrow: "aaynaDash_eyebrow",
  frame: "aaynaDash_frame",
  heading: "aaynaDash_heading",
  identity: "aaynaDash_identity",
  identityText: "aaynaDash_identityText",
  intro: "aaynaDash_intro",
  introIcon: "aaynaDash_introIcon",
  main: "aaynaDash_main",
  menuButton: "aaynaDash_menuButton",
  navItem: "aaynaDash_navItem",
  navigation: "aaynaDash_navigation",
  period: "aaynaDash_period",
  primary: "aaynaDash_primary",
  scrim: "aaynaDash_scrim",
  selected: "aaynaDash_selected",
  sideBottom: "aaynaDash_sideBottom",
  sideHead: "aaynaDash_sideHead",
  sideSection: "aaynaDash_sideSection",
  sideTitle: "aaynaDash_sideTitle",
  sidebar: "aaynaDash_sidebar",
  sidebarOpen: "aaynaDash_sidebarOpen",
  signOut: "aaynaDash_signOut",
  soon: "aaynaDash_soon",
  topLabel: "aaynaDash_topLabel",
  topbar: "aaynaDash_topbar",
  upcoming: "aaynaDash_upcoming",
  wordmark: "aaynaDash_wordmark",
} as const;

type Theme = "dark" | "light";
const THEME_KEY = "aayna-theme";
const THEME_EVENT = "aayna-theme-change";
function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}
function subscribeToTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}
type Role = "customer" | "admin";
type Appointment = { id: string; serviceName: string; serviceCategory: string; serviceImage: string | null; appointmentDate: string; timeSlot: string; servicePrice: number; status: string; paymentStatus: string; createdAt: string; message: string };
type Summary = { total: number; pending: number; confirmed: number; cancelled: number };
export function DashboardShell({ role, name, email, summary = null, summaryError = "", view = "overview", appointments = null, appointmentsError = "" }: { role: Role; name: string; email: string; summary?: Summary | null; summaryError?: string; view?: "overview" | "appointments"; appointments?: Appointment[] | null; appointmentsError?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [appointmentRows, setAppointmentRows] = useState<Appointment[] | null>(appointments);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const theme = useSyncExternalStore(subscribeToTheme, readTheme, () => "light" as Theme);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(THEME_KEY, next);
    document.documentElement.dataset.theme = next;
    window.dispatchEvent(new Event(THEME_EVENT));
  }
  const firstName = name.trim().split(/\s+/)[0] || "there";
  const items = role === "customer"
    ? [{ label: "Overview", icon: LayoutGrid, active: view === "overview", href: "/dashboard/customer" }, { label: "My appointments", icon: CalendarDays, active: view === "appointments", href: "/dashboard/customer?view=appointments" }, { label: "My profile", icon: CircleUserRound }]
    : [{ label: "Overview", icon: LayoutGrid, active: true }];
  async function cancelAppointment() {
    if (!cancelId || cancelling) return;
    setCancelling(true); setCancelMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${encodeURIComponent(cancelId)}/cancel`, {
        method: "PATCH", credentials: "include", cache: "no-store",
      });
      const result = await response.json().catch(() => null) as { success?: boolean; message?: string } | null;
      if (!response.ok || !result?.success) throw new Error(result?.message || "Cancellation failed.");
      setAppointmentRows((rows) => rows?.map((row) => row.id === cancelId ? { ...row, status: "cancelled" } : row) ?? null);
      setCancelId(null); setCancelMessage("Appointment cancelled successfully.");
      router.refresh();
    } catch (cause) {
      setCancelMessage(cause instanceof Error ? cause.message : "Unable to cancel appointment.");
    } finally { setCancelling(false); }
  }
  async function signOut() {
    setSigningOut(true); setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message || "Unable to sign out");
      router.replace("/sign-in"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to sign out"); setSigningOut(false); }
  }
  return <div className={styles.frame} data-aayna-dashboard>
    <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`} aria-label="Dashboard navigation">
      <div className={styles.sideHead}><Link href="/" className={styles.wordmark} onClick={() => setMenuOpen(false)}>aayna<span className={styles.dot}>.</span></Link><button className={styles.close} aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={22}/></button></div>
      <div className={styles.sideSection}><span className={styles.eyebrow}>WORKSPACE</span><p className={styles.sideTitle}>{role === "customer" ? "Your account" : "Administration"}</p></div>
      <nav className={styles.navigation}>{items.map(({label,icon:Icon,active,...rest}) => <div key={label} className={`${styles.navItem} ${active ? styles.selected : styles.upcoming}`} aria-current={active ? "page" : undefined}>{"href" in rest && typeof rest.href === "string" ? <Link href={rest.href} onClick={() => setMenuOpen(false)} className="aaynaDash_navLink"><Icon size={19} strokeWidth={1.8}/><span>{label}</span></Link> : <><Icon size={19} strokeWidth={1.8}/><span>{label}</span>{!active && <span className={styles.soon}>Soon</span>}</>}</div>)}</nav>
      <div className={styles.sideBottom}><Link href="/services" className={styles.external}><Scissors size={18}/> Explore services <ChevronRight size={16}/></Link><div className={styles.identity}><span className={styles.avatar}>{name.slice(0,1).toUpperCase()}</span><span className={styles.identityText}><strong>{name}</strong><small>{email}</small></span></div></div>
    </aside>
    {menuOpen && <button className={styles.scrim} aria-label="Close navigation" onClick={() => setMenuOpen(false)}/>}
    <div className={styles.content}>
      <header className={styles.topbar}><button className={styles.menuButton} aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={22}/></button><span className={styles.topLabel}>AAYNA <span>/</span> {role === "customer" ? "Customer dashboard" : "Admin dashboard"}</span><button type="button" className="aaynaDash_themeToggle" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} title={theme === "dark" ? "Light mode" : "Dark mode"}>{theme === "dark" ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}</button><button className={styles.signOut} onClick={signOut} disabled={signingOut}><LogOut size={17}/><span>{signingOut ? "Signing out…" : "Sign out"}</span></button></header>
      <main className={styles.main}><div className={styles.heading}><p className={styles.eyebrow}>{role === "customer" ? "YOUR SPACE" : "ADMIN WORKSPACE"}</p><h1>{view === "appointments" && role === "customer" ? "My appointments" : <>Welcome back, {firstName}<span className={styles.period}>.</span></>}</h1><p>{view === "appointments" && role === "customer" ? "Your requests, schedules, and payment status." : role === "customer" ? "Your appointments and account, in one place." : "Your management workspace."}</p></div>
      {role === "customer" && view === "appointments" ? <section className="aaynaDash_history" aria-label="My appointments">
        <div className="aaynaDash_historyHeader"><span className={styles.eyebrow}>YOUR BOOKINGS</span><Link href="/services" className={styles.primary}>Book a service <ChevronRight size={17}/></Link></div>
        <div className="aaynaDash_filters" role="group" aria-label="Filter appointments">{["all","pending","confirmed","cancelled"].map((filter) => <button key={filter} type="button" aria-pressed={statusFilter === filter} onClick={() => setStatusFilter(filter)}>{filter === "all" ? "All" : filter[0].toUpperCase() + filter.slice(1)}</button>)}</div>
        {appointmentRows === null ? <div className="aaynaDash_statsError" role="alert">{appointmentsError || "Appointments unavailable."} <button onClick={() => router.refresh()}>Retry</button></div> : appointmentRows.filter((a) => statusFilter === "all" || a.status === statusFilter).length === 0 ? <div className="aaynaDash_historyEmpty">No {statusFilter === "all" ? "appointments yet" : `${statusFilter} appointments`}. <Link href="/services">Browse services</Link></div> : <div className="aaynaDash_historyList">{appointmentRows.filter((a) => statusFilter === "all" || a.status === statusFilter).map((a) => <article key={a.id} className="aaynaDash_historyCard"><div className="aaynaDash_historyTop"><div className="aaynaDash_historyThumb" aria-hidden="true"><Scissors size={24}/></div><div className="aaynaDash_historyName"><h2>{a.serviceName}</h2><p>{a.serviceCategory}</p></div><span className="aaynaDash_status" data-status={a.status}>{a.status}</span></div><dl className="aaynaDash_historyMeta"><div><dt>Date</dt><dd>{a.appointmentDate}</dd></div><div><dt>Time</dt><dd>{a.timeSlot}</dd></div><div><dt>Price</dt><dd>{typeof a.servicePrice === "number" ? `৳${a.servicePrice.toLocaleString()}` : "—"}</dd></div><div><dt>Payment</dt><dd>{a.paymentStatus}</dd></div><div><dt>Requested</dt><dd>{a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-BD") : "—"}</dd></div></dl><button className="aaynaDash_detailsButton" type="button" aria-expanded={expandedId === a.id} onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>{expandedId === a.id ? "Hide details" : "View details"} <ChevronRight size={16}/></button>{expandedId === a.id && <div className="aaynaDash_details"><p><strong>Request ID</strong> {a.id}</p><p><strong>Message</strong> {a.message || "No message provided."}</p>{a.status === "pending" && a.paymentStatus === "unpaid" ? <button type="button" className="aaynaDash_cancelButton" onClick={() => { setCancelId(a.id); setCancelMessage(""); }}>Cancel appointment</button> : null}{a.status === "confirmed" && a.paymentStatus === "unpaid" ? <p>Payment will be available after secure Stripe checkout is implemented.</p> : null}</div>}</article>)}</div>}
      </section> : role === "customer" ? <section className="aaynaDash_overview" aria-label="Appointment overview">
        <div className="aaynaDash_overviewHead"><div><p className={styles.eyebrow}>AT A GLANCE</p><h2>Appointments overview</h2><p>All your appointment requests, in one view.</p></div><Link href="/services" className={styles.primary}>Browse services <ChevronRight size={17}/></Link></div>
        {summary ? <div className="aaynaDash_stats">
          {([{ label: "Total requests", value: summary.total, icon: CalendarDays }, { label: "Pending", value: summary.pending, icon: LayoutGrid }, { label: "Confirmed", value: summary.confirmed, icon: CalendarDays }, { label: "Cancelled", value: summary.cancelled, icon: X }] as const).map(({ label, value, icon: Icon }) => <article key={label} className="aaynaDash_stat"><div className="aaynaDash_statTop"><span>{label}</span><Icon size={20} strokeWidth={1.7} aria-hidden="true"/></div><strong>{value.toLocaleString()}</strong></article>)}
        </div> : <div className="aaynaDash_statsError" role="status">{summaryError || "Appointment statistics are unavailable."} <button type="button" onClick={() => router.refresh()}>Retry</button></div>}
      </section> : <section className={styles.intro} aria-label="Dashboard introduction"><div className={styles.introIcon}><LayoutGrid size={25} strokeWidth={1.5}/></div><div><h2>Everything in its place.</h2><p>Your administration modules will be added one feature at a time.</p><Link href="/services" className={styles.primary}>Explore services <ChevronRight size={17}/></Link></div></section>}
      {cancelMessage && <p role="status" className="aaynaDash_cancelNotice">{cancelMessage}</p>}
      {cancelId && <div className="aaynaDash_dialogBackdrop"><div role="alertdialog" aria-modal="true" aria-labelledby="aayna-cancel-title" aria-describedby="aayna-cancel-desc" className="aaynaDash_dialog"><h2 id="aayna-cancel-title">Cancel this appointment?</h2><p id="aayna-cancel-desc">This pending request will be cancelled and its time slot released. This action cannot be undone.</p><div className="aaynaDash_dialogActions"><button type="button" disabled={cancelling} onClick={() => { setCancelId(null); setCancelMessage(""); }}>Keep appointment</button><button type="button" disabled={cancelling} onClick={cancelAppointment}>{cancelling ? "Cancelling…" : "Yes, cancel"}</button></div>{cancelMessage && <p role="alert">{cancelMessage}</p>}</div></div>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      </main>
    </div>
  </div>;
}
