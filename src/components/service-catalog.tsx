"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { cachedServices, loadServices, type Service } from "@/lib/public-services";
export function ServiceCatalog() {
  const [rows, setRows] = useState<Service[]>([]);
  const [hasData, setHasData] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const mounted = useRef(false);
  const refresh = useCallback(async (force = false) => {
    setBusy(true); setError("");
    const cached = cachedServices();
    if (cached) { setRows(cached.rows); setHasData(true); }
    try { const result = await loadServices(force); if (mounted.current) { setRows(result.rows); setHasData(true); } }
    catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : "Unable to load services."); }
    finally { if (mounted.current) setBusy(false); }
  }, []);
  useEffect(() => {
    mounted.current = true;
    const check = () => { if (document.visibilityState === "visible") void refresh(); };
    const initial = setTimeout(check, 0);
    const interval = setInterval(check, 300000);
    window.addEventListener("focus", check);
    return () => { mounted.current = false; clearTimeout(initial); clearInterval(interval); window.removeEventListener("focus", check); };
  }, [refresh]);
  return <div aria-busy={busy}>
    {busy && <p role="status">{hasData ? "Checking for updates…" : "Connecting and loading services…"}</p>}
    {error && <p role="alert">{error} {hasData && "Showing previously saved services."}</p>}
    <button className="api-retry" disabled={busy} onClick={() => void refresh(true)}>Refresh services</button>
    {hasData && rows.length === 0 && <p>No active services are available yet.</p>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginTop:24}}>{rows.map(row => <article key={row._id} style={{border:"1px solid currentColor",borderRadius:16,padding:20}}><p className="eyebrow">{row.category}</p><h2>{row.serviceName}</h2><p>{row.description}</p><p>৳{row.price} · {row.duration} min</p></article>)}</div>
  </div>;
}
