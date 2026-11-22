import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function SalonDetailsEntry() {
  let session: { user?: { isBlocked?: boolean } } | null = null;
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      headers: { cookie: (await cookies()).toString() },
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Auth service unavailable");
    session = await response.json();
  } catch {
    return <section className="inner-page"><h1>Unable to verify your session</h1><p className="inner-description">Check that AAYNA&apos;s local API is running, then try again.</p></section>;
  }
  if (!session?.user) redirect("/sign-in");
  if (session.user.isBlocked) redirect("/");
  return (
    <section className="inner-page">
      <p className="eyebrow">SALON DETAILS</p>
      <h1>Every detail matters.</h1>
      <p className="inner-description">Select a salon or service to explore its details. Individual salon profiles are being built next.</p>
      <Link href="/services" className="mt-8 inline-flex min-h-11 items-center rounded-xl border-2 border-[#FF5100] px-5 text-sm font-bold text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[#FF5100]">Browse Services</Link>
    </section>
  );
}
