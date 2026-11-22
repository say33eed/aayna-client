import type { Metadata } from "next";
import { Suspense } from "react";
import { ServiceCatalog } from "@/components/service-catalog";

export const metadata: Metadata = { title: "Explore Salon Services | AAYNA", description: "Browse active salon and grooming services on AAYNA." };

export default function ServicesPage() {
  return <main className="aayna-browse-page">
    <div className="aayna-browse-container">
      <header className="aayna-browse-header">
        <p className="aayna-browse-kicker">AAYNA / THE SERVICE EDIT</p>
        <h1>Find the care that feels right.</h1>
        <p>Explore salon services, compare your options, and discover your next appointment.</p>
      </header>
      <Suspense fallback={<p role="status">Loading services…</p>}><ServiceCatalog /></Suspense>
    </div>
  </main>;
}
