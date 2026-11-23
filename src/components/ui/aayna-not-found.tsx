import Link from "next/link";
import { ArrowLeft, BookOpen, Scissors, SearchX } from "lucide-react";

type ErrorKind = "page" | "service" | "journal";

const messages = {
  page: { icon: SearchX, code: "404 / Page not found", title: "This page isn’t here.", description: "The address may have changed, or the page is no longer available.", action: "Back to home", href: "/", secondary: "Browse services", secondaryHref: "/services" },
  service: { icon: Scissors, code: "404 / Service unavailable", title: "Service not found.", description: "This service may have been removed or is no longer available for booking. Discover other services on Aayna.", action: "Explore available services", href: "/services", secondary: "Back to home", secondaryHref: "/" },
  journal: { icon: BookOpen, code: "404 / Article unavailable", title: "Article not found.", description: "This article may have been unpublished or moved. Explore the latest self-care stories.", action: "Browse the journal", href: "/journal", secondary: "Back to home", secondaryHref: "/" },
} as const;

export function AaynaNotFound({ kind }: { kind: ErrorKind }) {
  const item = messages[kind];
  const Icon = item.icon;
  return (
    <section className="aayna-error-page" aria-labelledby="aayna-error-title">
      <div className="aayna-error-panel">
        <div className="aayna-error-icon"><Icon size={30} strokeWidth={1.5} aria-hidden="true" /></div>
        <p className="aayna-error-kicker">{item.code}</p>
        <h1 className="aayna-error-title" id="aayna-error-title">{item.title}</h1>
        <p className="aayna-error-copy">{item.description}</p>
        <div className="aayna-error-actions">
          <Link className="aayna-error-action aayna-error-action--primary" href={item.href}>{item.action}</Link>
          <Link className="aayna-error-action aayna-error-action--secondary" href={item.secondaryHref}><ArrowLeft size={17} aria-hidden="true" />{item.secondary}</Link>
        </div>
      </div>
    </section>
  );
}
