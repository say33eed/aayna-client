import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
export const dynamic = "force-dynamic";
export default async function DashboardGateway() {
  const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, { headers: { cookie: (await cookies()).toString() }, cache: "no-store" }).catch(() => null);
  if (!response?.ok) return <p className="py-16">Unable to verify your session. Check the backend connection.</p>;
  const session = await response.json() as { user?: { role?: string; isBlocked?: boolean } } | null;
  if (!session?.user) redirect("/sign-in");
  if (session.user.isBlocked) redirect("/");
  redirect(session.user.role === "admin" ? "/dashboard/admin" : "/dashboard/customer");
}
