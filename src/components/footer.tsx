import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { FooterLink } from "./ui/footer-link";

export function Footer() {
  return (
    <footer className="w-full shrink-0 border-t border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]">
      <div className="site-container grid grid-cols-1 items-start gap-x-10 gap-y-12 py-14 md:grid-cols-2 xl:grid-cols-[1.5fr_0.8fr_1fr_1fr] xl:py-20">
        <div className="flex min-w-0 flex-col items-start gap-4">
          <Link href="/" className="inline-flex items-center gap-2.5 text-[var(--foreground)] no-underline" aria-label="AAYNA home">
            <BrandMark size={28} color="accent" />
            <span className="font-[family-name:var(--font-quicksand)] text-[29px] leading-none font-extrabold tracking-[-0.055em]">
              aayna<span className="ml-0.5 inline-block size-1.5 rounded-full bg-[#FF5100]" aria-hidden="true" />
            </span>
          </Link>
          <p className="m-0 text-base font-extrabold">Looking good, simplified.</p>
          <p className="m-0 max-w-[290px] text-sm leading-7 text-[var(--muted)]">
            Find services you love and book care with confidence.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="flex min-w-0 flex-col items-start gap-4">
          <h2 className="mb-1 text-xs font-extrabold tracking-[0.1em] uppercase">Explore</h2>
          <FooterLink href="/">Home</FooterLink>
          <FooterLink href="/services" className="inline-flex items-center gap-1.5">
            Explore services <ArrowUpRight size={14} aria-hidden="true" />
          </FooterLink>
          <FooterLink href="/how-it-works">How it works</FooterLink>
        </nav>
        <section className="flex min-w-0 flex-col items-start gap-4" aria-labelledby="footer-location">
          <h2 id="footer-location" className="mb-1 text-xs font-extrabold tracking-[0.1em] uppercase">Location & hours</h2>
          <p className="m-0 flex items-start gap-2.5 text-sm leading-6 text-[var(--muted)]">
            <MapPin size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>Dhaka, Bangladesh</span>
          </p>
          <p className="m-0 flex items-start gap-2.5 text-sm leading-6 text-[var(--muted)]">
            <Clock3 size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>Opening hours vary by service provider.</span>
          </p>
        </section>
        <section className="flex min-w-0 flex-col items-start gap-4" aria-labelledby="footer-connect">
          <h2 id="footer-connect" className="mb-1 text-xs font-extrabold tracking-[0.1em] uppercase">Connect</h2>
          <p className="m-0 max-w-[240px] text-sm leading-6 text-[var(--muted)]">
            Official contact details and social channels will be available at launch.
          </p>
        </section>
      </div>
      <div className="w-full border-t border-[var(--border)]">
        <div className="site-container flex flex-col items-start justify-between gap-2 py-6 text-xs leading-5 text-[var(--muted)] md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} AAYNA. All rights reserved.</span>
          <span>Made for Dhaka. Designed for everywhere.</span>
        </div>
      </div>
    </footer>
  );
}
