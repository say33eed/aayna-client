import Link from "next/link";
import { Clock3, Mail, MapPin } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { FooterLink } from "./ui/footer-link";

const focus = "focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[#FF5100]";

export function Footer() {
  return (
    <footer className="w-full shrink-0 border-t border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]">
      <div className="site-container py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-y-11 text-center sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,1.3fr)_minmax(0,0.9fr)] lg:gap-x-12 xl:gap-x-16 lg:text-left">
          <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
            <Link href="/" aria-label="AAYNA home" className={`inline-flex items-center gap-2.5 rounded-md ${focus}`}>
            <BrandMark size={32} color="accent" />
            <span className="font-[family-name:var(--font-quicksand)] text-[32px] leading-none font-extrabold tracking-[-0.055em]">
              aayna<span className="ml-0.5 inline-block size-1.5 rounded-full bg-[#FF5100]" aria-hidden="true" />
            </span>
          </Link>
            <p className="m-0 max-w-md text-sm leading-7 text-[var(--muted)]">
            AAYNA brings beauty, wellness and grooming services together, making it easier to discover salons and book appointments.
          </p>
          </div>

          <nav aria-label="Footer navigation" className="flex min-w-0 flex-col items-center gap-4 lg:items-start">
            <h3 className="m-0 text-xs font-extrabold uppercase tracking-[0.12em]">Explore</h3>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/services">Browse Services</FooterLink>
          </nav>

          <section aria-labelledby="footer-salon-information" className="flex min-w-0 flex-col items-center gap-4 lg:items-start">
            <h3 id="footer-salon-information" className="m-0 text-xs font-extrabold uppercase tracking-[0.12em]">
              Salon information
            </h3>
            <p className="m-0 flex max-w-[280px] items-start justify-center gap-2 text-sm leading-6 text-[var(--muted)] lg:justify-start">
              <Mail size={17} className="mt-1 shrink-0" aria-hidden="true" />
              <span>Contact details are provided by each salon.</span>
            </p>
            <p className="m-0 flex max-w-[280px] items-start justify-center gap-2 text-sm leading-6 text-[var(--muted)] lg:justify-start">
              <MapPin size={17} className="mt-1 shrink-0" aria-hidden="true" />
              <span>Find salon addresses on their individual pages.</span>
            </p>
            <p className="m-0 flex max-w-[280px] items-start justify-center gap-2 text-sm leading-6 text-[var(--muted)] lg:justify-start">
              <Clock3 size={17} className="mt-1 shrink-0" aria-hidden="true" />
              <span>Opening hours vary by salon.</span>
            </p>
          </section>

          <section aria-labelledby="footer-connect" className="flex min-w-0 flex-col items-center gap-4 lg:items-start">
            <h3 id="footer-connect" className="m-0 text-xs font-extrabold uppercase tracking-[0.12em]">
              Connect
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[var(--muted)] lg:justify-start" aria-label="Social platforms">
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Open Instagram (opens in a new tab)" title="https://www.instagram.com/" className={`group inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-[var(--border)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--foreground)] focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[var(--foreground)]`}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 ">
                  <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
                  <circle cx="12" cy="12" r="4.2" />
                  <circle cx="17.7" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Open Facebook (opens in a new tab)" title="https://www.facebook.com/" className={`group inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-[var(--border)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--foreground)] focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[var(--foreground)]`}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-5 transition-colors duration-200 ">
                  <path d="M13.9 21v-8h2.7l.4-3.2h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.4a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.2H7.7V13h2.8v8h3.4Z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="Open YouTube (opens in a new tab)" title="https://www.youtube.com/" className={`group inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-[var(--border)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--foreground)] focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[var(--foreground)]`}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <rect x="2" y="5.5" width="20" height="13" rx="4" />
                  <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" className="" />
                </svg>
              </a>
            </div>
          </section>
        </div>
      </div>
      <div className="w-full border-t border-[var(--border)]">
        <div className="site-container flex flex-col items-center justify-between gap-2 py-6 text-center text-xs leading-6 text-[var(--muted)] lg:flex-row lg:text-left">
          <span>© {new Date().getFullYear()} AAYNA. All rights reserved.</span>
          <span>Care, thoughtfully connected.</span>
        </div>
      </div>
    </footer>
  );
}
