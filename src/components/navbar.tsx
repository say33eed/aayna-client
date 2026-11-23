/* eslint-disable @next/next/no-img-element -- Avatar images may use user-supplied external hosts. */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { BrandMark } from "./brand-mark";
import { NavigationLink } from "./ui/navigation-link";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import { notify } from "@/lib/notifications";

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

function Identity({ image, initials }: { image?: string | null; initials: string }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const url = image?.trim() || "";
  // Only load web images. Invalid or inaccessible URLs fall back to initials.
  const validUrl = /^https?:\/\//i.test(url) ? url : "";
  const showImage = Boolean(validUrl && failedImage !== validUrl);

  return (
    <span className="inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--foreground)] text-xs font-extrabold text-[var(--background)]" aria-hidden="true">
      {showImage ? (
        <img
          key={validUrl}
          src={validUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setFailedImage(validUrl)}
        />
      ) : initials}
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useSyncExternalStore(subscribeToTheme, readTheme, () => "light" as Theme);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const blocked = Boolean(user && "isBlocked" in user && user.isBlocked === true);
  const admin = Boolean(user && "role" in user && user.role === "admin");
  const dashboardHref = admin ? "/dashboard/admin" : "/dashboard/customer";
  const fullName = user?.name?.trim() || "Account";
  const givenName = fullName.split(/\s+/)[0] || "Account";
  const initials = fullName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "A";
  const [homeSection, setHomeSection] = useState<"home" | "how-it-works" | "journal">("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const accountFirstRef = useRef<HTMLAnchorElement>(null);

  const active = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  useEffect(() => {
    if (pathname !== "/") return;
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const journal = document.getElementById("journal");
        const how = document.getElementById("how-it-works");
        const marker = window.scrollY + 160;
        const section = journal && marker >= journal.offsetTop
          ? "journal"
          : how && marker >= how.offsetTop
            ? "how-it-works"
            : "home";
        setHomeSection(section);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("hashchange", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("hashchange", update);
    };
  }, [pathname]);

  const homeActive = pathname === "/" && homeSection === "home";
  const howActive = pathname === "/" && homeSection === "how-it-works";
  const journalActive = (pathname === "/" && homeSection === "journal") || active("/journal");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    // Close open menus after navigation without a synchronous effect update.
    const task = window.setTimeout(() => {
      setMobileOpen(false);
      setAccountOpen(false);
    }, 0);
    return () => window.clearTimeout(task);
  }, [pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    accountFirstRef.current?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
        accountTriggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [accountOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        mobileTriggerRef.current?.focus();
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setMobileOpen(false);
    };
    document.addEventListener("keydown", closeEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [mobileOpen]);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(THEME_KEY, next);
    document.documentElement.dataset.theme = next;
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message || "Logout failed");
      setMobileOpen(false);
      setAccountOpen(false);
      notify.success("Signed out successfully.", { id: "aayna-sign-out" });
      router.replace("/");
      router.refresh();
    } catch {
      notify.error("Could not sign out. Please try again.", { id: "aayna-sign-out-error" });
    } finally {
      setSigningOut(false);
    }
  }

  function closeMenus() {
    setMobileOpen(false);
    setAccountOpen(false);
  }

  const focusRing = "focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[#FF5100]";

  const apertureClass = [
    "group inline-flex min-h-11 items-center gap-2.5 rounded-full border-2 border-[#FF5100]",
    "bg-[var(--surface)] px-2.5 py-1.5 text-sm font-bold text-[var(--foreground)]! no-underline",
    "transition-colors duration-200 hover:bg-[var(--background)]",
    focusRing,
  ].join(" ");

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full shrink-0 border-b border-[var(--border)] text-[var(--foreground)] backdrop-blur-2xl"
      style={{ backgroundColor: "color-mix(in srgb, var(--background) 76%, transparent)" }}
    >
      <div className="site-container grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 xl:h-[72px] xl:grid-cols-[minmax(175px,1fr)_auto_minmax(235px,1fr)]">
        <Link href="/" onClick={closeMenus} aria-label="AAYNA home" className={`inline-flex w-fit shrink-0 items-center gap-2.5 rounded-md ${focusRing}`}>
          <BrandMark size={28} color="accent" />
          <span className="font-[family-name:var(--font-quicksand)] text-[32px] leading-none font-extrabold tracking-[-0.055em]">aayna<span className="ml-0.5 inline-block size-1.5 rounded-full bg-[#FF5100]" aria-hidden="true" /></span>
        </Link>

        <nav className="hidden items-center justify-center gap-7 xl:flex" aria-label="Main navigation">
          <NavigationLink href="/" active={homeActive}>Home</NavigationLink>
          <Link href="/services" aria-current={active("/services") ? "page" : undefined} className={apertureClass}>
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-[#FF5100] text-[#FF5100] transition-transform duration-200 motion-safe:group-hover:scale-110" aria-hidden="true">
              <Search size={15} strokeWidth={2.5} />
            </span>
            <span>Browse Services</span>
            <ArrowUpRight size={15} className="text-[var(--muted)] transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <NavigationLink href="/#how-it-works" active={howActive}>How It Works</NavigationLink>
          <NavigationLink href="/#journal" active={journalActive}>Journal</NavigationLink>
        </nav>

        <div className="flex items-center justify-end gap-2 xl:gap-3">
          <button type="button" onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-transparent text-[var(--foreground)] transition-colors hover:border-[var(--border)] hover:bg-[var(--surface)] ${focusRing}`}>
            {theme === "dark" ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
          </button>

          {!isPending && !user && <div className="hidden items-center gap-4 xl:flex">
            <NavigationLink href="/sign-in" active={active("/sign-in")}>Sign In</NavigationLink>
            <Button asChild size="sm"><Link href="/sign-up">Sign Up</Link></Button>
          </div>}

          {!isPending && user && <div ref={accountRef} className="relative hidden xl:block">
            <button ref={accountTriggerRef} type="button" aria-expanded={accountOpen} aria-controls="aayna-account-popover" aria-haspopup="true"
              onClick={() => { setAccountOpen((open) => !open); }}
              className={`inline-flex h-11 max-w-52 items-center gap-2 rounded-full border-2 border-[var(--border)] bg-[var(--surface)] p-1 pr-3 text-[var(--foreground)] transition-colors hover:border-[#FF5100] ${focusRing}`}>
              <Identity image={user.image} initials={initials} />
              <span className="max-w-24 truncate text-sm font-bold">{givenName}</span>
              <ChevronDown size={15} className={`shrink-0 transition-transform ${accountOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            {accountOpen && <div id="aayna-account-popover" aria-label="Account details" className="absolute right-0 top-[calc(100%+12px)] z-[60] w-[290px] rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)]">
              <div className="flex items-center gap-3 border-b border-[var(--border)] px-1 pb-4 pt-1">
                <Identity image={user.image} initials={initials} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">{fullName}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">{blocked ? "Account restricted" : admin ? "Administrator" : "Customer"}</p>
                </div>
              </div>
              {!blocked && <Link ref={accountFirstRef} href={dashboardHref} onClick={closeMenus}
                className={`mt-2 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-[var(--foreground)]! no-underline transition-colors hover:bg-[var(--surface)] ${focusRing}`}>
                <LayoutDashboard size={18} aria-hidden="true" /> Dashboard
              </Link>}
              <button type="button" onClick={signOut} disabled={signingOut}
                className={`mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-50 ${focusRing}`}>
                <LogOut size={18} className="text-[#FF5100]" aria-hidden="true" /> {signingOut ? "Signing out…" : "Logout"}
              </button>
            </div>}
          </div>}

          {isPending && <span className="hidden h-11 w-28 rounded-full border border-[var(--border)] bg-[var(--surface)] xl:block" aria-hidden="true" />}
          <button ref={mobileTriggerRef} type="button" onClick={() => { setMobileOpen((open) => !open); setAccountOpen(false); }}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} aria-controls="aayna-mobile-navigation"
            className={`inline-flex size-11 items-center justify-center rounded-xl border-2 border-[var(--border)] text-[var(--foreground)] transition-colors hover:border-[#FF5100] hover:bg-[var(--surface)] xl:hidden ${focusRing}`}>
            {mobileOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen && <nav id="aayna-mobile-navigation" aria-label="Mobile navigation" className="border-t border-[var(--border)] bg-[var(--background)] xl:hidden">
        <div className="site-container flex flex-col items-start gap-2 py-5">
          <NavigationLink href="/" active={homeActive} onClick={closeMenus} className="min-h-11">Home</NavigationLink>
          <Link href="/services" onClick={closeMenus} aria-current={active("/services") ? "page" : undefined}
            className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 border-[#FF5100] bg-[var(--surface)] px-3 text-[var(--foreground)]! no-underline transition-colors hover:bg-[var(--background)] ${focusRing}`}>
            <span className="inline-flex size-9 items-center justify-center rounded-full border-2 border-[#FF5100] text-[#FF5100]"><Search size={18} strokeWidth={2.5} aria-hidden="true" /></span>
            <span className="flex flex-1 flex-col gap-0.5"><span className="text-sm font-extrabold">Browse Services</span><span className="text-xs text-[var(--muted)]">Find your next service</span></span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <NavigationLink href="/#how-it-works" active={howActive} onClick={closeMenus} className="min-h-11">How It Works</NavigationLink>
          <NavigationLink href="/#journal" active={journalActive} onClick={closeMenus} className="min-h-11">Journal</NavigationLink>
          {!isPending && user && <div className="mt-2 w-full border-t border-[var(--border)] pt-4">
            <div className="flex items-center gap-3 pb-3">
              <Identity image={user.image} initials={initials} />
              <div className="min-w-0"><p className="truncate text-sm font-bold">{fullName}</p><p className="text-xs text-[var(--muted)]">{blocked ? "Account restricted" : admin ? "Administrator" : "Customer"}</p></div>
            </div>
            {!blocked && <Link href={dashboardHref} onClick={closeMenus} className={`flex min-h-11 items-center gap-3 rounded-xl px-2 text-sm font-bold text-[var(--foreground)]! hover:bg-[var(--surface)] ${focusRing}`}><LayoutDashboard size={18} aria-hidden="true" /> Dashboard</Link>}
            <button type="button" onClick={signOut} disabled={signingOut} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm font-bold hover:bg-[var(--surface)] disabled:opacity-50 ${focusRing}`}><LogOut size={18} className="text-[#FF5100]" aria-hidden="true" />{signingOut ? "Signing out…" : "Logout"}</button>
          </div>}
          {!isPending && !user && <div className="flex w-full flex-col gap-3 border-t border-[var(--border)] pt-4">
            <NavigationLink href="/sign-in" active={active("/sign-in")} onClick={closeMenus} className="min-h-11">Sign In</NavigationLink>
            <Button asChild className="w-full"><Link href="/sign-up" onClick={closeMenus}>Sign Up</Link></Button>
          </div>}
        </div>
      </nav>}
    </header>
  );
}
