import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <section className="inner-page">
      <p className="eyebrow">EXPLORE AAYNA</p>
      <h1>Find your next look.</h1>
      <p className="inner-description">We’re preparing a curated selection of salon and grooming services in Dhaka. Service listings and bookings will become available once our platform is connected.</p>
      <p className="status-note">Services coming soon</p>
      <Link href="/" className="text-link"><ArrowLeft size={17} /> Back to home</Link>
    </section>
  );
}
