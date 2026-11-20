
"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export default function Home() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("aayna-theme");

    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      document.documentElement.dataset.theme = saved;
    } else {
      document.documentElement.dataset.theme = "dark";
    }
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";

    setTheme(next);
    localStorage.setItem("aayna-theme", next);
    document.documentElement.dataset.theme = next;
  }

  return (
    <div className="site-shell">
      <header className="header">
        <a className="logo" href="/" aria-label="AAYNA Home">
          aayna<span>.</span>
        </a>

        <div className="header-actions">
          <span className="country-label">🇧🇩 BD</span>

          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <p className="eyebrow">
            GROOMING & SELF-CARE · DHAKA
          </p>

          <h1>Your next look, simplified.</h1>

          <p className="hero-description">
            Discover and book salon & grooming services
            in your location.
          </p>

          <div className="hero-actions">
            <span className="primary-button">
              Coming soon
            </span>
          </div>

          <p className="launch-note">
            Starting in Dhaka, Bangladesh.
          </p>
        </section>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} AAYNA</span>
        <span>Made for every look.</span>
      </footer>
    </div>
  );
}
