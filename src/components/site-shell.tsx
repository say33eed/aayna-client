
"use client";

import { ApiStatus } from "./api-status";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { BrandMark } from "./brand-mark";

type Theme = "dark" | "light";

const THEME_KEY = "aayna-theme";
const THEME_EVENT = "aayna-theme-change";

function getTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.localStorage.getItem(THEME_KEY) === "light"
    ? "light"
    : "dark";
}

function getServerTheme(): Theme {
  return "dark";
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

export function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const theme = useSyncExternalStore(
    subscribeToTheme,
    getTheme,
    getServerTheme
  );

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    const next: Theme =
      theme === "dark" ? "light" : "dark";

    window.localStorage.setItem(THEME_KEY, next);

    document.documentElement.dataset.theme = next;

    window.dispatchEvent(new Event(THEME_EVENT));
  }

  const links = [
    { href: "/services", label: "Services" },
    { href: "/how-it-works", label: "How it works" },
  ];

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link
          href="/"
          className="brand"
          aria-label="AAYNA home"
          onClick={() => setMenuOpen(false)}
        >
          <BrandMark size={36} />

          <span>
            aayna<span className="brand-dot">.</span>
          </span>
        </Link>

        <nav
          className="desktop-nav"
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
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
      </header>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="mobile-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      <ApiStatus />
      <main className="main-content">
        {children}
      </main>

      <footer className="site-footer">
        <span>
          © {new Date().getFullYear()} AAYNA
        </span>

        <span>Looking good, simplified.</span>
      </footer>
    </div>
  );
}
