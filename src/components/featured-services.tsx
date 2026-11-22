/* eslint-disable @next/next/no-img-element -- Service images use variable remote hosts. */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock3, RotateCw } from "lucide-react";
import { loadServices, type Service } from "@/lib/public-services";

const money = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });

function ServiceCard({ service }: { service: Service }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = typeof service.image === "string" ? service.image.trim() : "";
  return (
    <article className="aayna-featured-card">
      <div className="aayna-featured-media">
        {image && !imageFailed ? (
          // External salon images can come from different providers, so avoid a fixed Next.js remote-host allowlist.
          <img src={image} alt={service.serviceName || "Salon service"} loading="lazy" onError={() => setImageFailed(true)} />
        ) : (
          <div className="aayna-featured-imageFallback" aria-label="Service image unavailable">AAYNA</div>
        )}
      </div>
      <div className="aayna-featured-cardBody">
        <p className="aayna-featured-category">{service.category || "Salon service"}</p>
        <h3>{service.serviceName}</h3>
        <p className="aayna-featured-description">{service.description || "Discover more about this salon service."}</p>
        <div className="aayna-featured-meta">
          <strong>{Number.isFinite(Number(service.price)) ? money.format(Number(service.price)) : "Price on request"}</strong>
          <span><Clock3 size={15} aria-hidden="true" /> {Number.isFinite(Number(service.duration)) ? `${service.duration} min` : "Duration varies"}</span>
        </div>
        <Link href={`/services/${encodeURIComponent(service._id)}`} className="aayna-featured-detail">
          View Details <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function FeaturedServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  const refresh = useCallback(async (force = false) => {
    setStatus("loading");
    setError("");
    try {
      const entry = await loadServices(force);
      // The public endpoint already filters status=active on the server.
      // Do not use cached results as the sole source of truth for bookability.
      setServices(entry.rows.filter((service) => Boolean(service._id)).slice(0, 6));
      setStatus("ready");
    } catch (reason) {
      setServices([]);
      setError(reason instanceof Error ? reason.message : "Services could not be loaded.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    let active = true;
    void loadServices(true).then((entry) => {
      if (!active) return;
      setServices(entry.rows.filter((s) => Boolean(s._id)).slice(0, 6));
      setStatus("ready");
    }).catch((reason) => {
      if (!active) return;
      setServices([]);
      setError(reason instanceof Error ? reason.message : "Services could not be loaded.");
      setStatus("error");
    });
    return () => { active = false; };
  }, []);

  return (
    <section className="aayna-featured" aria-labelledby="aayna-featured-title">
      <div className="aayna-featured-inner">
        <header className="aayna-featured-heading">
          <div>
            <p className="aayna-featured-kicker">FEATURED SALON SERVICES</p>
            <h2 id="aayna-featured-title">Popular services, thoughtfully selected.</h2>
            <p className="aayna-featured-intro">Discover salon services available to explore on AAYNA.</p>
          </div>
          <Link href="/services" className="aayna-featured-browse">Browse All Services <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </header>
        {status === "loading" && <div role="status" className="aayna-featured-grid" aria-label="Loading featured services">{Array.from({ length: 6 }, (_, index) => <div key={index} className="aayna-featured-skeleton" aria-hidden="true" />)}</div>}
        {status === "error" && <div className="aayna-featured-state" role="alert"><p>{error}</p><button type="button" onClick={() => void refresh(true)}><RotateCw size={16} aria-hidden="true" /> Try again</button></div>}
        {status === "ready" && services.length === 0 && <div className="aayna-featured-state"><p>No active services are available yet. Check back soon.</p></div>}
        {status === "ready" && services.length > 0 && <div className="aayna-featured-grid">{services.map((service) => <ServiceCard key={service._id} service={service} />)}</div>}
      </div>
    </section>
  );
}
