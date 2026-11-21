"use client";
import { useEffect, useSyncExternalStore } from "react";
import { RefreshCw, CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { ensureConnection, subscribe, snapshot, serverSnapshot } from "@/lib/connection";
export function ApiStatus() {
  const state = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  useEffect(() => { void ensureConnection(); }, []);
  const Icon = state === "checking" ? LoaderCircle : state === "ready" ? CheckCircle2 : CircleAlert;
  return <section className="api-status" aria-label="System connectivity" style={{margin: "16px 0"}}>
    <div className="api-status-copy" role="status"><Icon size={18} className={state === "checking" ? "api-status-spin" : undefined}/><div>
      <p className="api-status-heading">{state === "ready" ? "All systems connected" : state === "checking" ? "Connecting to AAYNA…" : state === "backend" ? "Server unavailable" : "Database unavailable"}</p>
      <p className="api-status-detail">Frontend ready · Backend {state === "ready" || state === "database" ? "connected" : state === "checking" ? "checking" : "unavailable"} · Database {state === "ready" ? "connected" : state === "database" ? "unavailable" : "unverified"}</p>
    </div></div>
    <button className="api-retry" type="button" disabled={state === "checking"} onClick={() => void ensureConnection(true)}><RefreshCw size={15}/> Retry</button>
  </section>;
}
