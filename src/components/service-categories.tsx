"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { loadServices, type Service } from "@/lib/public-services";
import { API_BASE_URL } from "@/lib/api";

const priority = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
];

export function ServiceCategories() {
  const [services, setServices] = useState<Service[]>([]);
  const [savedCategories, setSavedCategories] = useState<string[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;
    void Promise.all([
      loadServices(true),
      fetch(`${API_BASE_URL}/api/services/categories`, { cache: "no-store" }).then(async (response) => {
        if (!response.ok) throw new Error("Category request failed");
        const result = await response.json() as { success: boolean; data: string[] };
        if (!result.success || !Array.isArray(result.data)) throw new Error("Invalid categories");
        return result.data;
      }),
    ]).then(([entry, names]) => {
      if (!alive) return;
      setServices(entry.rows);
      setSavedCategories(names);
      setState("ready");
    }).catch(() => { if (alive) setState("error"); });
    return () => { alive = false; };
  }, []);

  const byCategory = new Map<string, Service>();
  for (const service of services) {
    const name = service.category?.trim();
    if (name && !byCategory.has(name)) byCategory.set(name, service);
  }
  const categories = [...new Set([...savedCategories, ...byCategory.keys()])].sort((a, b) => {
    const ai = priority.indexOf(a);
    const bi = priority.indexOf(b);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi) || a.localeCompare(b);
  });

  return (
    <section className="aayna-categories" aria-labelledby="aayna-categories-title">
      <div className="aayna-categories-inner">
        <header className="aayna-categories-header">
          <p className="aayna-categories-eyebrow">EXPLORE BY CATEGORY</p>
          <h2 id="aayna-categories-title">Find your kind of care.</h2>
          <p>Explore the services that fit your needs.</p>
        </header>
        {state === "loading" && <div className="aayna-categories-grid" role="status" aria-label="Loading categories">{Array.from({length: 7}, (_, i) => <div className="aayna-categories-placeholder" key={i} />)}</div>}
        {state === "error" && <div className="aayna-categories-message" role="alert">Categories are temporarily unavailable. <Link href="/services">Browse all services</Link></div>}
        {state === "ready" && categories.length === 0 && <div className="aayna-categories-message">Categories will appear when they are configured.</div>}
        {state === "ready" && categories.length > 0 && (
          <div className="aayna-categories-grid">
            {categories.map((name, i) => {
              const representative = byCategory.get(name);
              return (
                <Link className={`aayna-categories-tile${i === 0 ? " aayna-categories-tile--featured" : ""}`} key={name} href={`/services?category=${encodeURIComponent(name)}`} aria-label={`Explore ${name} services`}>
                  {representative?.image ? (
                    // Images originate from salon service records and can have different external hosts.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={representative.image} alt="" loading="lazy" />
                  ) : <span className="aayna-categories-noImage" aria-hidden="true">AAYNA</span>}
                  <span className="aayna-categories-shade" aria-hidden="true" />
                  <span className="aayna-categories-label">{name}<ArrowUpRight size={21} aria-hidden="true" /></span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
