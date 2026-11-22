import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";
type Session = { user?: { name?: string; role?: string; isBlocked?: boolean } } | null;
export default async function Dashboard({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (role !== "customer" && role !== "admin") notFound();
  const cookieHeader = (await cookies()).toString();
  let session: Session = null;
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      headers: { cookie: cookieHeader }, cache: "no-store",
    });
    if (!response.ok) throw new Error("Authentication unavailable");
    session = (await response.json()) as Session;
  } catch {
    return <main className="mx-auto max-w-2xl py-20"><h1 className="text-2xl font-bold">Unable to verify your session</h1><p className="mt-4 text-[var(--muted)]">Check that the AAYNA API is running and try again.</p></main>;
  }
  if (!session?.user) redirect(`/sign-in?next=${encodeURIComponent(`/dashboard/${role}`)}`);
  if (session.user.isBlocked) redirect("/");
  const actualRole = session.user.role === "admin" ? "admin" : "customer";
  if (actualRole !== role) redirect(`/dashboard/${actualRole}`);
  return (
    <section className="mx-auto max-w-5xl py-12 sm:py-20">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF5100]">{role} workspace</p>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight">Welcome, {session.user.name || "there"}.</h1>
      <p className="mt-4 max-w-xl text-[var(--muted)]">Your secure dashboard is ready for the upcoming appointment and account-management modules.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] p-6"><h2 className="font-extrabold">{role === "admin" ? "Manage services" : "My appointments"}</h2><p className="mt-2 text-sm text-[var(--muted)]">This module is under development.</p></div>
        <div className="rounded-2xl border border-[var(--border)] p-6"><h2 className="font-extrabold">My profile</h2><p className="mt-2 text-sm text-[var(--muted)]">Profile management is coming next.</p></div>
      </div>
      <Link href="/services" className="mt-8 inline-block text-sm font-bold text-[var(--foreground)] underline underline-offset-4">Browse Services</Link>
    </section>
  );
}
