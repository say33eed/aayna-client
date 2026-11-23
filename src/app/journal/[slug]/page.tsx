import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import type { JournalArticle } from "@/lib/journal";
export const dynamic = "force-dynamic";
export default async function JournalArticlePage({params}: {params: Promise<{slug:string}>}) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) notFound();
  let row: JournalArticle | null = null;
  try { const response = await fetch(`${API_BASE_URL}/api/journal/${encodeURIComponent(slug)}`, { cache: "no-store" }); if (response.status === 404) notFound(); const result = await response.json(); if (response.ok && result.success) row = result.data; } catch (e) { if (e && typeof e === "object" && "digest" in e && e.digest === "NEXT_HTTP_ERROR_FALLBACK;404") throw e; }
  if (!row) return <main className="aaynaJournal_article"><p>Article temporarily unavailable.</p><Link href="/journal">Back to journal</Link></main>;
  return <article className="aaynaJournal_article"><nav className="aaynaJournal_articleNav" aria-label="Journal navigation"><Link href="/journal" className="aaynaJournal_back">← All self-care tips</Link></nav><div className="aaynaJournal_articleMeta"><span className="aaynaJournal_kicker">{row.category}</span></div><h1>{row.title}</h1><p className="aaynaJournal_lead">{row.excerpt}</p><div className="aaynaJournal_hero"><Image src={row.image} alt="" fill unoptimized sizes="(max-width: 800px) 100vw, 800px" style={{objectFit:"cover"}} /></div><div className="aaynaJournal_body">{row.body.split(/\n\s*\n/).map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div><Link href="/journal" className="aaynaJournal_back">Explore more tips →</Link></article>;
}
