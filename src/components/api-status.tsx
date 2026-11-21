"use client";
import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { getApiHealth } from "@/lib/api";
type Status = "checking" | "connected" | "unavailable" | "unverified";
function StatusRow({ label, status }: { label: string; status: Status }) {
  const Icon = status === "connected" ? CheckCircle2 : status === "checking" ? LoaderCircle : CircleAlert;
  return <div className="api-status-copy"><Icon size={17} className={status === "checking" ? "api-status-spin" : undefined} aria-hidden="true"/><div><p className="api-status-heading">{label}</p><p className="api-status-detail">{status}</p></div></div>;
}
export function ApiStatus() {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ attempt: number; backend: Status; database: Status } | null>(null);
  useEffect(() => {
    let active = true;
    void getApiHealth().then(data => {
      if (active) setResult({ attempt, backend: "connected", database: data.data.database === "connected" ? "connected" : data.data.database === "disconnected" ? "unavailable" : "unverified" });
    }, () => {
      if (active) setResult({ attempt, backend: "unavailable", database: "unverified" });
    });
    return () => { active = false; };
  }, [attempt]);
  const current = result?.attempt === attempt ? result : null;
  return <section className="api-status" aria-label="System connectivity" style={{alignItems: "flex-start"}}>
    <div style={{display: "grid", gap: 16}} aria-live="polite">
      <p className="api-status-heading">System connectivity</p>
      <StatusRow label="Frontend" status="connected" />
      <StatusRow label="Backend" status={current?.backend ?? "checking"} />
      <StatusRow label="Database" status={current?.database ?? "unverified"} />
    </div>
    <button type="button" className="api-retry" disabled={!current} onClick={() => setAttempt(n => n + 1)}><RefreshCw size={15} aria-hidden="true"/> Retry</button>
  </section>;
}
