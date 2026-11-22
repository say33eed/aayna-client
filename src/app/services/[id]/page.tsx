"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { loadServices, type Service } from "@/lib/public-services";

const money = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });

export default function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [service, setService] = useState<Service | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  useEffect(() => {
    let active = true;
    void loadServices(true).then((entry) => {
      if (!active) return;
      const found = entry.rows.find((item) => item._id === id);
      setService(found ?? null);
      setState(found ? "ready" : "missing");
    }).catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, [id]);
  return (
    <section className="aayna-service-detailPage">
      <Link href="/services" className="aayna-service-back"><ArrowLeft size={17} /> Browse services</Link>
      {state === "loading" && <p role="status">Loading service details…</p>}
      {state === "error" && <p role="alert">Service details are temporarily unavailable. Please try again later.</p>}
      {state === "missing" && <p role="status">This service is no longer available.</p>}
      {state === "ready" && service && <>
        <p className="aayna-featured-kicker">{service.category}</p>
        <h1>{service.serviceName}</h1>
        <p>{service.description}</p>
        <div className="aayna-service-detailMeta">
          <strong>{money.format(service.price)}</strong>
          <span><Clock3 size={17} aria-hidden="true" /> {service.duration} min</span>
        </div>
        {service.image && <div className="aayna-service-detailImage">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={service.image} alt={service.serviceName} />
        </div>}
      </>}
    </section>
  );
}
