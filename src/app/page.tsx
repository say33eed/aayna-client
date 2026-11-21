import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ApiStatus } from "@/components/api-status";

export default function Home() {
  return (
    <section className="hero">
      <p className="eyebrow">GROOMING &amp; SELF-CARE · DHAKA</p>
      <h1>Looking good,<br />simplified.</h1>
      <p className="hero-description">Discover and book salon &amp; grooming services in your location.</p>
      <div className="hero-actions">
        <Link href="/services" className="button button-primary">Explore services <ArrowUpRight size={17} /></Link>
        <Link href="/how-it-works" className="button button-secondary">How it works</Link>
      </div>
      <p className="support-note">Starting in Dhaka, Bangladesh.</p>
      <ApiStatus />
    </section>
  );
}
