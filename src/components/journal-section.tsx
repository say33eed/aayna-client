"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { JournalArticle } from "@/lib/journal";

export function JournalSection() {
  const [rows, setRows] = useState<JournalArticle[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/journal?limit=3", { signal: controller.signal }).then(r => r.ok ? r.json() : null).then(result => { if (!controller.signal.aborted && result?.success && Array.isArray(result.data)) setRows(result.data); }).catch(() => {});
    return () => controller.abort();
  }, []);
  if (!rows.length) return null;
  return <section className="aaynaJournal" aria-labelledby="journal-heading"><div className="aaynaJournal_header"><div><span className="aaynaJournal_kicker">THE AAYNA JOURNAL</span><h2 id="journal-heading">A little care goes a long way.</h2><p>Thoughtful, practical self-care for the moments between appointments.</p></div><Link className="aaynaJournal_all" href="/journal">Explore all tips <ArrowUpRight size={18}/></Link></div><div className="aaynaJournal_grid">{rows.map(row => <Link href={`/journal/${row.slug}`} className="aaynaJournal_card" key={row._id}><div className="aaynaJournal_photo"><Image src={row.image} alt="" fill unoptimized sizes="(max-width: 720px) 100vw, 33vw" style={{objectFit:"cover"}} /></div><span className="aaynaJournal_category">{row.category}</span><h3>{row.title}</h3><p>{row.excerpt}</p><span className="aaynaJournal_read">Read tip <ArrowUpRight size={15}/></span></Link>)}</div></section>;
}
