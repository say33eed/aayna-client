import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
export const dynamic = "force-dynamic";
export default async function DashboardGateway({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, { headers: { cookie: (await cookies()).toString() }, cache: "no-store" }).catch(() => null);
  if (!response?.ok) return <p className="py-16">Unable to verify your session. Check the backend connection.</p>;
  const session = await response.json() as { user?: { role?: string; isBlocked?: boolean } } | null;
  if (!session?.user) redirect("/sign-in");
  if (session.user.isBlocked) redirect("/");
  const role = session.user.role === "admin" ? "admin" : "customer";
  const next = (await searchParams).next;
  if (role === "customer" && next && /^\/services\/[a-f0-9]{24}$/i.test(next)) redirect(next);
  redirect(`/dashboard/${role}`);
}
