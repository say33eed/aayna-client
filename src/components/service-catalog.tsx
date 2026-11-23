/* eslint-disable @next/next/no-img-element -- Service images use variable remote hosts. */
"use client";

import { AaynaSelect } from "@/components/ui/aayna-select";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ArrowUpRight, Clock3, Search, RotateCw, X } from "lucide-react";
import { loadServices, type Service } from "@/lib/public-services";
import { notify } from "@/lib/notifications";
import { API_BASE_URL } from "@/lib/api";

const PAGE_SIZE = 9;
const money = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", minimumFractionDigits: 0, maximumFractionDigits: 2 });
type Sort = "default" | "price_asc" | "price_desc";

function Card({ service }: { service: Service }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = typeof service.image === "string" ? service.image.trim() : "";
  return <article className="aayna-browse-card">
    <div className="aayna-browse-photo">
      {image && !imageFailed ? (
        // Images originate from service records; their external hosts are not fixed.
        <img src={image} alt={service.serviceName || "Salon service"} loading="lazy" onError={() => setImageFailed(true)} />
      ) : <span className="aayna-browse-photoFallback">AAYNA</span>}
      <span className="aayna-browse-photoCategory">{service.category || "Salon service"}</span>
    </div>
    <div className="aayna-browse-cardContent">
      <div className="aayna-browse-titleRow"><h2>{service.serviceName}</h2><strong>{Number.isFinite(Number(service.price)) ? money.format(Number(service.price)) : "Ask for price"}</strong></div>
      <p className="aayna-browse-summary">{service.description || "Discover this salon service on AAYNA."}</p>
      <div className="aayna-browse-duration"><Clock3 size={16} aria-hidden="true" /> {Number.isFinite(Number(service.duration)) ? `${service.duration} min` : "Duration varies"}</div>
      <Link className="aayna-browse-details" href={`/services/${encodeURIComponent(service._id)}`}>View Details <ArrowUpRight size={17} aria-hidden="true" /></Link>
    </div>
  </article>;
}

export function ServiceCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "";
  const sortParam = params.get("sort") ?? "default";
  const sort: Sort = sortParam === "price_asc" || sortParam === "price_desc" ? sortParam : "default";
  const pageParam = Number(params.get("page") ?? "1");
  const page = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const [query, setQuery] = useState(search);
  const [rows, setRows] = useState<Service[]>([]);
  const [publicCategories, setPublicCategories] = useState<string[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  const update = useCallback((changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (!value || (key === "sort" && value === "default") || (key === "page" && value === "1")) next.delete(key);
      else next.set(key, value);
    }
    const suffix = next.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  useEffect(() => {
    const task = window.setTimeout(() => setQuery(search), 0);
    return () => window.clearTimeout(task);
  }, [search]);
  useEffect(() => {
    const timeout = window.setTimeout(() => { if (query !== search) update({ search: query.trim(), page: null }); }, 350);
    return () => window.clearTimeout(timeout);
  }, [query, search, update]);

  const refresh = useCallback(async (showErrorToast = false) => {
    setState("loading"); setError("");
    try {
      const result = await loadServices(true);
      setRows(result.rows.filter((s) => Boolean(s._id)));
      try {
        const response = await fetch(`${API_BASE_URL}/api/services/categories`, { cache: "no-store" });
        const data = await response.json() as { success?: boolean; data?: string[] };
        if (response.ok && data.success && Array.isArray(data.data)) setPublicCategories(data.data);
      } catch { /* Service list remains available if categories temporarily fail. */ }
      setState("ready");
    } catch (e) {
      setRows([]);
      const detail = e instanceof Error ? e.message : "Unable to load services.";
      setError(detail);
      setState("error");
      if (showErrorToast) notify.error("Could not refresh services", { description: detail });
    }
  }, []);
  useEffect(() => {
    // Defer the initial refresh so its loading state is not set during effect setup.
    const task = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(task);
  }, [refresh]);

  const categories = useMemo(() => [...new Set([...publicCategories, "Miscellaneous", ...rows.map((s) => s.category?.trim()).filter((c): c is string => Boolean(c))])].sort((a,b) => a.localeCompare(b)), [rows, publicCategories]);
  const filtered = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase();
    const result = rows.filter((s) => (!category || s.category === category) && (!normalized || s.serviceName?.toLocaleLowerCase().includes(normalized)));
    if (sort === "price_asc") result.sort((a,b) => Number(a.price) - Number(b.price) || a.serviceName.localeCompare(b.serviceName));
    if (sort === "price_desc") result.sort((a,b) => Number(b.price) - Number(a.price) || a.serviceName.localeCompare(b.serviceName));
    return result;
  }, [rows, search, category, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const shown = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = Boolean(search || category || sort !== "default");

  return <div className="aayna-browse-catalog" aria-busy={state === "loading"}>
    <div className="aayna-browse-toolbar">
      <label className="aayna-browse-search"><Search size={20} aria-hidden="true" /><span className="sr-only">Search services by name</span><input type="search" placeholder="Search services by name" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      <label className="aayna-browse-select"><span className="sr-only">Filter by category</span><AaynaSelect value={category} onChange={(e) => update({ category: e.target.value, page: null })}><option value="">All categories</option>{category && !categories.includes(category) && <option value={category}>{category}</option>}{categories.map((name) => <option key={name} value={name}>{name}</option>)}</AaynaSelect></label>
      <label className="aayna-browse-select"><span className="sr-only">Sort services by price</span><AaynaSelect value={sort} onChange={(e) => update({ sort: e.target.value, page: null })}><option value="default">Recommended order</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option></AaynaSelect></label>
    </div>
    {state === "error" && <div className="aayna-browse-notice" role="alert"><p>{error}</p><button type="button" onClick={() => void refresh(true)}><RotateCw size={16} /> Try again</button></div>}
    {state === "loading" && <div className="aayna-browse-grid" role="status" aria-label="Loading services">{Array.from({ length: 6 }, (_, i) => <div className="aayna-browse-skeleton" key={i} />)}</div>}
    {state === "ready" && <>
      <div className="aayna-browse-results"><span>{filtered.length === 0 ? "No matching services" : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length} services`}</span>{hasFilters && <button type="button" onClick={() => { setQuery(""); update({ search: null, category: null, sort: null, page: null }); }}><X size={15} /> Clear filters</button>}</div>
      {shown.length > 0 ? <div className="aayna-browse-grid">{shown.map((service) => <Card key={service._id} service={service} />)}</div> : <div className="aayna-browse-empty"><h2>{rows.length === 0 ? "Services are coming soon." : "No services match your search."}</h2><p>{rows.length === 0 ? "Please check back for new services." : "Try another service name or category."}</p>{hasFilters && <button type="button" onClick={() => { setQuery(""); update({ search: null, category: null, sort: null, page: null }); }}>Clear all filters <ArrowRight size={17} /></button>}</div>}
      {pages > 1 && <nav className="aayna-browse-pagination" aria-label="Service results pages"><button type="button" disabled={currentPage === 1} onClick={() => update({ page: String(currentPage - 1) })}>Previous</button><span>Page {currentPage} of {pages}</span><button type="button" disabled={currentPage === pages} onClick={() => update({ page: String(currentPage + 1) })}>Next</button></nav>}
    </>}
  </div>;
}
