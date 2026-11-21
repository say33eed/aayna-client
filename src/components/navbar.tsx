"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { NavigationLink } from "./ui/navigation-link";
import { Button } from "./ui/button";

type Theme = "dark" | "light";
const THEME_KEY = "aayna-theme";
const THEME_EVENT = "aayna-theme-change";
const links = [
  { href: "/services", label: "Explore services" },
  { href: "/how-it-works", label: "How it works" },
];
function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
}
function subscribeToTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}
export function Navbar() {
  const pathname = usePathname();
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, () => "dark" as Theme);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [menuOpen]);
  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(THEME_KEY, next);
    document.documentElement.dataset.theme = next;
    window.dispatchEvent(new Event(THEME_EVENT));
  }
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");
  return (
    <>
      <header className="site-header">
        <div className="site-container navbar-inner">
        <Link
          href="/"
          className="brand"
          aria-label="AAYNA home"
          onClick={() => setMenuOpen(false)}
        >
          <BrandMark size={28} color="accent" />

          <span>
            aayna<span className="brand-dot" aria-hidden="true" />
          </span>
        </Link>

        <nav
          className="desktop-nav"
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <NavigationLink
              key={link.href}
              href={link.href}
              active={active(link.href)}
            >
              {link.label}
            </NavigationLink>
          ))}
        </nav>

        <div className="header-actions">
          <Button asChild size="sm">
            <Link href="/services" aria-label="Explore available services">
              Explore <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </Button>
          <span
            className="market-label"
            title="Initial service area: Dhaka, Bangladesh"
          >
            Dhaka, BD
          </span>

          <button
            type="button"
            className="icon-button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun size={19} />
            ) : (
              <Moon size={19} />
            )}
          </button>

          <button
            type="button"
            className="icon-button mobile-menu-button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={
              menuOpen
                ? "Close navigation"
                : "Open navigation"
            }
            onClick={() =>
              setMenuOpen((open) => !open)
            }
          >
            {menuOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>
        </div>
        </div>
      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          <div className="site-container mobile-nav-inner">
          {links.map((link) => (
            <NavigationLink
              key={link.href}
              href={link.href}
              active={active(link.href)}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavigationLink>
          ))}
          </div>
        </nav>
      )}
      </header>
    </>
  );
}
