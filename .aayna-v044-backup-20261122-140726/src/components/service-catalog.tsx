"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { cachedServices, loadServices, type Service } from "@/lib/public-services";
import { runOperation } from "@/lib/operations";
export function ServiceCatalog() {
  const [rows, setRows] = useState<Service[]>([]);
  const [hasData, setHasData] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const mounted = useRef(false);
  const manual = useRef<AbortController | null>(null);
  const refresh = useCallback(async (force = false) => {
    if (manual.current) return;
    const controller = force ? new AbortController() : null;
    if (controller) manual.current = controller;
    setBusy(true); setError("");
    const cached = cachedServices();
    if (cached) { setRows(cached.rows); setHasData(true); }
    try {
      const result = force ? await runOperation("refresh-services", async () => {
        const entry = await loadServices(true);
        return { success: true, message: cached?.tag && cached.tag === entry.tag ? "Services are up to date." : "Services refreshed.", data: entry };
      }, controller?.signal) : { success: true as const, data: await loadServices() };
      if (mounted.current && result?.success) { setRows(result.data.rows); setHasData(true); }
      if (mounted.current && result && !result.success) setError(result.message);
    }
    catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : "Unable to load services."); }
    finally { if (controller) manual.current = null; if (mounted.current) setBusy(false); }
  }, []);
  useEffect(() => {
    mounted.current = true;
    const check = () => { if (document.visibilityState === "visible") void refresh(); };
    const initial = setTimeout(check, 0);
    const interval = setInterval(check, 300000);
    window.addEventListener("focus", check);
    return () => { mounted.current = false; manual.current?.abort(); clearTimeout(initial); clearInterval(interval); window.removeEventListener("focus", check); };
  }, [refresh]);
  return <div aria-busy={busy}>
    {busy && <p role="status">{hasData ? "Checking for updates…" : "Connecting and loading services…"}</p>}
    {error && <p role="alert">{error} {hasData && "Showing previously saved services."}</p>}
    <button className="api-retry" disabled={busy} onClick={() => void refresh(true)}>Refresh services</button>
    {hasData && rows.length === 0 && <p>No active services are available yet.</p>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginTop:24}}>{rows.map(row => <article key={row._id} style={{border:"1px solid currentColor",borderRadius:16,padding:20}}><p className="eyebrow">{row.category}</p><h2>{row.serviceName}</h2><p>{row.description}</p><p>৳{row.price} · {row.duration} min</p></article>)}</div>
  </div>;
}
