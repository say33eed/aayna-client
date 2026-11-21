import Link from "next/link";
import { BrandMark } from "./brand-mark";

export function Footer() {
  return (
      <footer className="site-footer">
        <div className="footer-main">
          <Link href="/" className="footer-brand-group" aria-label="AAYNA home">
            <BrandMark size={23} color="accent" />
            <span className="footer-wordmark">aayna<span className="brand-dot" aria-hidden="true" /></span>
          </Link>
          <p className="footer-tagline">Looking good, simplified.</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <Link href="/services">Explore services</Link>
          <Link href="/how-it-works">How it works</Link>
        </nav>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} AAYNA. All rights reserved.</span>
          <span>Made for Dhaka. Designed for everywhere.</span>
        </div>
      </footer>
  );
}
