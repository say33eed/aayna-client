import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CalendarCheck2, CreditCard, Search, Sparkles } from "lucide-react";

const steps = [
  { icon: Search, number: "01", title: "Explore", description: "Find the salon service that feels right for you." },
  { icon: CalendarCheck2, number: "02", title: "Request", description: "Choose an available date and time to request your appointment." },
  { icon: CreditCard, number: "03", title: "Confirm & pay", description: "Once confirmed, complete payment securely through Stripe." },
  { icon: Sparkles, number: "04", title: "Enjoy", description: "Visit your salon at the confirmed appointment time." },
];

export function HowItWorksSection({ detailed = false }: { detailed?: boolean }) {
  return (
    <section aria-labelledby={detailed ? "how-it-works-page-title" : "how-it-works-home-title"} id="how-it-works" className="site-container scroll-mt-20 py-16 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--border)] pb-8">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">THE AAYNA EXPERIENCE</p>
          {detailed ? <h1 id="how-it-works-page-title" className="text-4xl font-bold tracking-tight md:text-6xl">Your next appointment, made simple.</h1> : <h2 id="how-it-works-home-title" className="text-3xl font-bold tracking-tight md:text-5xl">A little care, four simple steps.</h2>}
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">From discovering a service to arriving at your appointment, Aayna keeps the process clear and easy.</p>
        </div>
      </div>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map(({ icon: Icon, number, title, description }) => (
          <li key={number} className="flex min-h-56 flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-7">
            <div className="flex items-center justify-between"><Icon size={25} strokeWidth={1.7} aria-hidden="true" /><span className="text-xs font-bold tracking-[0.16em] text-[var(--muted)]">{number}</span></div>
            <h3 className="mt-9 text-xl font-bold tracking-tight">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{description}</p>
          </li>
        ))}
      </ol>
      {<div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-[var(--border)] p-6 md:p-8"><div><h2 className="text-xl font-bold">Ready to find your next service?</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Browse services freely. Sign in when you are ready to request an appointment.</p></div><Button asChild size="lg" className="rounded-full"><Link href="/services">Browse Services <ArrowUpRight size={17} aria-hidden="true" /></Link></Button></div>}
    </section>
  );
}
