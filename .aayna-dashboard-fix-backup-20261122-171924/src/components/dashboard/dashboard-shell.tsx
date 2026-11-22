"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight, CircleUserRound, LayoutGrid, LogOut, Menu, Scissors, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import styles from "./dashboard-shell.module.css";

type Role = "customer" | "admin";
export function DashboardShell({ role, name, email }: { role: Role; name: string; email: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const firstName = name.trim().split(/\s+/)[0] || "there";
  const items = role === "customer"
    ? [{ label: "Overview", icon: LayoutGrid, active: true }, { label: "My appointments", icon: CalendarDays }, { label: "My profile", icon: CircleUserRound }]
    : [{ label: "Overview", icon: LayoutGrid, active: true }];
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
      <nav className={styles.navigation}>{items.map(({label,icon:Icon,active}) => <div key={label} className={`${styles.navItem} ${active ? styles.selected : styles.upcoming}`} aria-current={active ? "page" : undefined}><Icon size={19} strokeWidth={1.8}/><span>{label}</span>{!active && <span className={styles.soon}>Soon</span>}</div>)}</nav>
      <div className={styles.sideBottom}><Link href="/services" className={styles.external}><Scissors size={18}/> Explore services <ChevronRight size={16}/></Link><div className={styles.identity}><span className={styles.avatar}>{name.slice(0,1).toUpperCase()}</span><span className={styles.identityText}><strong>{name}</strong><small>{email}</small></span></div></div>
    </aside>
    {menuOpen && <button className={styles.scrim} aria-label="Close navigation" onClick={() => setMenuOpen(false)}/>}
    <div className={styles.content}>
      <header className={styles.topbar}><button className={styles.menuButton} aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={22}/></button><span className={styles.topLabel}>AAYNA <span>/</span> {role === "customer" ? "Customer dashboard" : "Admin dashboard"}</span><button className={styles.signOut} onClick={signOut} disabled={signingOut}><LogOut size={17}/><span>{signingOut ? "Signing out…" : "Sign out"}</span></button></header>
      <main className={styles.main}><div className={styles.heading}><p className={styles.eyebrow}>{role === "customer" ? "YOUR SPACE" : "ADMIN WORKSPACE"}</p><h1>Welcome back, {firstName}<span className={styles.period}>.</span></h1><p>{role === "customer" ? "Your appointments and account, in one place." : "Your management workspace."}</p></div>
      <section className={styles.intro} aria-label="Dashboard introduction"><div className={styles.introIcon}><LayoutGrid size={25} strokeWidth={1.5}/></div><div><h2>Everything in its place.</h2><p>{role === "customer" ? "Your appointment overview is being prepared. You can explore available services now; appointment history and account editing will be added in the next steps." : "Your administration modules will be added one feature at a time."}</p><Link href="/services" className={styles.primary}>Explore services <ChevronRight size={17}/></Link></div></section>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      </main>
    </div>
  </div>;
}
