import Link from "next/link";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/api";
import type { JournalArticle } from "@/lib/journal";
export const dynamic = "force-dynamic";
export default async function JournalPage() {
  let rows: JournalArticle[] = [];
  try { const response = await fetch(`${API_BASE_URL}/api/journal?limit=40`, { cache: "no-store" }); const result = await response.json(); if (response.ok && result.success && Array.isArray(result.data)) rows = result.data; } catch {}
  return <main className="aaynaJournal aaynaJournal_page"><span className="aaynaJournal_kicker">THE AAYNA JOURNAL</span><h1>Everyday care, thoughtfully shared.</h1><p className="aaynaJournal_intro">Practical hair, skin, nail and wellness tips curated by Aayna.</p>{!rows.length ? <p>No articles have been published yet. Check back soon.</p> : <div className="aaynaJournal_grid">{rows.map(row => <Link href={`/journal/${row.slug}`} className="aaynaJournal_card" key={row._id}><div className="aaynaJournal_photo"><Image src={row.image} alt="" fill unoptimized sizes="(max-width: 720px) 100vw, 33vw" style={{objectFit:"cover"}} /></div><span className="aaynaJournal_category">{row.category}</span><h2>{row.title}</h2><p>{row.excerpt}</p><span className="aaynaJournal_read">Read tip →</span></Link>)}</div>}</main>;
}
