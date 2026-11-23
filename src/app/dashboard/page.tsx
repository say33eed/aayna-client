import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
export const dynamic = "force-dynamic";
export default async function DashboardGateway({ searchParams }: { searchParams: Promise<{ next?: string; oauth?: string }> }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, { headers: { cookie: (await cookies()).toString() }, cache: "no-store" }).catch(() => null);
  if (!response?.ok) return <p className="py-16">Unable to verify your session. Check the backend connection.</p>;
  const session = await response.json() as { user?: { role?: string; isBlocked?: boolean } } | null;
  if (!session?.user) redirect("/sign-in");
  if (session.user.isBlocked) redirect("/");
  const role = session.user.role === "admin" ? "admin" : "customer";
  const params = await searchParams;
  const next = params.next;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") && !next.includes(":") && !next.includes("%") ? next : null;
  const oauthFlag = params.oauth === "1" ? "?aayna_google_success=1" : "";
  if (safeNext && !safeNext.startsWith("/dashboard/")) {
    redirect(`${safeNext}${oauthFlag ? `${safeNext.includes("?") ? "&" : "?"}aayna_google_success=1` : ""}`);
  }
  if (safeNext === `/dashboard/${role}` || safeNext === "/dashboard") redirect(`/dashboard/${role}${oauthFlag}`);
  redirect(`/dashboard/${role}${oauthFlag}`);
}
