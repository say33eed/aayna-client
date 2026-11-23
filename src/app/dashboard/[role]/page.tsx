import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const dynamic = "force-dynamic";
type Session = { user?: { name?: string; email?: string; role?: string; isBlocked?: boolean } } | null;
export default async function Dashboard({ params, searchParams }: { params: Promise<{ role: string }>; searchParams: Promise<{ view?: string }> }) {
  const { role } = await params;
  const { view } = await searchParams;
  const activeView = view === "appointments" && (role === "customer" || role === "admin") ? "appointments" : view === "services" && role === "admin" ? "services" : view === "journal" && role === "admin" ? "journal" : view === "users" && role === "admin" ? "users" : view === "transactions" && role === "admin" ? "transactions" : view === "profile" ? "profile" : "overview";
  if (role !== "customer" && role !== "admin") notFound();
  let session: Session;
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      headers: { cookie: (await cookies()).toString() }, cache: "no-store",
    });
    if (!response.ok) throw new Error("Session verification unavailable");
    session = (await response.json()) as Session;
  } catch {
    return <main className="mx-auto max-w-2xl p-10"><h1 className="text-2xl font-semibold">Unable to verify your session</h1><p className="mt-4">Please try again when the Aayna API is available.</p></main>;
  }
  if (!session?.user) redirect(`/sign-in?next=${encodeURIComponent(`/dashboard/${role}`)}`);
  if (session.user.isBlocked) redirect("/");
  const actualRole = session.user.role === "admin" ? "admin" : "customer";
  if (actualRole !== role) redirect(`/dashboard/${actualRole}`);
  let summary: { total: number; pending: number; confirmed: number; cancelled: number } | null = null;
  let summaryError = "";
  if (actualRole === "customer") {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/my-summary`, {
        headers: { cookie: (await cookies()).toString() }, cache: "no-store",
      });
      if (!response.ok) throw new Error("Could not load appointment statistics.");
      const result = await response.json() as { success?: boolean; data?: typeof summary };
      if (!result.success || !result.data) throw new Error("Invalid appointment statistics.");
      summary = result.data;
    } catch {
      summaryError = "Your appointment statistics are temporarily unavailable. Please refresh to try again.";
    }
  }
  type Appointment = { id: string; serviceName: string; serviceCategory: string; serviceImage: string | null; appointmentDate: string; timeSlot: string; servicePrice: number; status: string; paymentStatus: string; createdAt: string; message: string };
  let appointments: Appointment[] | null = null;
  let appointmentsError = "";
  if (actualRole === "customer" && activeView === "appointments") {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/mine`, {
        headers: { cookie: (await cookies()).toString() }, cache: "no-store",
      });
      if (!response.ok) throw new Error(`Unable to load appointments (HTTP ${response.status}).`);
      const result = await response.json() as { success?: boolean; data?: Appointment[] };
      if (!result.success || !Array.isArray(result.data)) throw new Error("Invalid appointment list");
      appointments = result.data;
    } catch {
      appointmentsError = "Unable to load appointments. Please retry; if this persists, check the backend API logs.";
    }
  }
  type AdminOverview = { customers: number; activeServices: number; requests: number; pending: number; confirmed: number; successfulPayments: number; recent: { id: string; service: string; date: string; time: string; status: string; paymentStatus: string; createdAt: string }[] };
  let adminOverview: AdminOverview | null = null;
  let adminError = "";
  if (actualRole === "admin") {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/overview`, { headers: { cookie: (await cookies()).toString() }, cache: "no-store" });
      if (!response.ok) throw new Error("Admin statistics unavailable");
      const result = await response.json() as { success?: boolean; data?: AdminOverview };
      if (!result.success || !result.data || !Array.isArray(result.data.recent)) throw new Error("Invalid admin overview");
      adminOverview = result.data;
    } catch { adminError = "Unable to load live admin statistics. Please retry."; }
  }
  return <DashboardShell adminOverview={adminOverview} adminError={adminError} role={actualRole} name={session.user.name || "Account"} email={session.user.email || ""} summary={summary} summaryError={summaryError} view={activeView} appointments={appointments} appointmentsError={appointmentsError} />;
}
