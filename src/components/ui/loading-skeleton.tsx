import type { CSSProperties } from "react";

type Shape = "line" | "block" | "circle";

export function Skeleton({ className = "", shape = "block", style }: { className?: string; shape?: Shape; style?: CSSProperties }) {
  return <span aria-hidden="true" className={`aayna-skeleton aayna-skeleton--${shape} ${className}`} style={style} />;
}

export function ContentSkeleton({ rows = 4, title = "Loading content" }: { rows?: number; title?: string }) {
  return <div className="aayna-loading-content" role="status" aria-label={title} aria-busy="true">
    <span className="sr-only">{title}</span>
    {Array.from({ length: rows }, (_, index) => <Skeleton key={index} shape="line" style={{ width: index % 3 === 2 ? "62%" : index % 2 ? "78%" : "94%" }} />)}
  </div>;
}

export function CardGridSkeleton({ count = 6, title = "Loading services" }: { count?: number; title?: string }) {
  return <div className="aayna-loading-card-grid" role="status" aria-label={title} aria-busy="true">
    <span className="sr-only">{title}</span>
    {Array.from({ length: count }, (_, index) => <div className="aayna-loading-card" key={index} aria-hidden="true"><Skeleton className="aayna-loading-photo"/><div className="aayna-loading-card-body"><Skeleton shape="line" style={{ width: "38%" }}/><Skeleton shape="line" style={{ width: "82%" }}/><Skeleton shape="line" style={{ width: "66%" }}/></div></div>)}
  </div>;
}

export function ListSkeleton({ rows = 5, title = "Loading records" }: { rows?: number; title?: string }) {
  return <div className="aayna-loading-list" role="status" aria-label={title} aria-busy="true">
    <span className="sr-only">{title}</span>
    {Array.from({ length: rows }, (_, index) => <div className="aayna-loading-list-row" key={index} aria-hidden="true"><Skeleton shape="circle" className="aayna-loading-avatar"/><div className="aayna-loading-list-text"><Skeleton shape="line" style={{ width: `${70 - index % 3 * 12}%` }}/><Skeleton shape="line" style={{ width: "46%" }}/></div><Skeleton shape="line" className="aayna-loading-list-end"/></div>)}
  </div>;
}

export function DashboardSkeleton() {
  return <main className="aayna-loading-dashboard" role="status" aria-label="Loading dashboard" aria-busy="true">
    <span className="sr-only">Loading dashboard</span>
    <aside className="aayna-loading-sidebar" aria-hidden="true"><Skeleton shape="line" style={{ width: "60%", height: 28 }}/>{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} shape="line" style={{ width: i % 2 ? "66%" : "83%", height: 20 }}/>)}</aside>
    <div className="aayna-loading-dashboard-main" aria-hidden="true"><Skeleton shape="line" style={{ width: "32%", height: 34 }}/><div className="aayna-loading-stats">{Array.from({ length: 4 }, (_, i) => <div className="aayna-loading-stat" key={i}><Skeleton shape="line" style={{ width: "60%" }}/><Skeleton shape="line" style={{ width: "42%", height: 30 }}/></div>)}</div><ListSkeleton rows={5}/></div>
  </main>;
}
