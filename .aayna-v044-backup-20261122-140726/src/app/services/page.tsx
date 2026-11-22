import type { Metadata } from "next";
import { ServiceCatalog } from "@/components/service-catalog";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <section className="inner-page">
      <p className="eyebrow">EXPLORE AAYNA</p>
      <h1>Find your next look.</h1>
      <p className="inner-description">Explore available salon and grooming services in Dhaka.</p>
      <ServiceCatalog />
      <Link href="/" className="text-link"><ArrowLeft size={17} /> Back to home</Link>
    </section>
  );
}
