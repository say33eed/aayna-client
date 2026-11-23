/* eslint-disable @next/next/no-img-element -- Service images use variable remote hosts. */
"use client";

import { ContentSkeleton, Skeleton } from "@/components/ui/loading-skeleton";
import { ActionSpinner } from "@/components/ui/action-spinner";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { loadServices, type Service } from "@/lib/public-services";
import { notify } from "@/lib/notifications";

const money = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", minimumFractionDigits: 0, maximumFractionDigits: 2 });
type Slot = { time: string; available: boolean };
const today = () => {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};

export default function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as ({ id: string; role?: string; isBlocked?: boolean }) | undefined;
  const userId = user?.id;
  const isBlocked = user?.isBlocked;
  const [service, setService] = useState<Service | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsState, setSlotsState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "success">("idle");
  const [notice, setNotice] = useState("");
  const [refreshSlots, setRefreshSlots] = useState(0);

  useEffect(() => {
    if (!userId || isBlocked) return;
    let active = true;
    void loadServices(true).then((entry) => {
      if (!active) return;
      const found = entry.rows.find((item) => item._id === id);
      setService(found ?? null);
      setState(found ? "ready" : "missing");
    }).catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, [id, userId, isBlocked]);

  useEffect(() => {
    if (!service || !date) return;
    const controller = new AbortController();
    // Resetting the slot happens in the date change handler; fetch starts asynchronously.
    const start = window.setTimeout(() => setSlotsState("loading"), 0);
    void fetch(`/api/appointments/slots?serviceId=${encodeURIComponent(id)}&date=${encodeURIComponent(date)}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok || !body.success || !Array.isArray(body.data)) throw new Error(body.message || "Time slots are unavailable.");
        return body.data as Slot[];
      }).then((data) => { if (!controller.signal.aborted) { setSlots(data); setSlotsState("ready"); } })
      .catch(() => { if (!controller.signal.aborted) { setSlotsState("error"); notify.error("Could not check availability", { description: "Please try another date or retry shortly." }); } });
    return () => { window.clearTimeout(start); controller.abort(); };
  }, [id, date, service, refreshSlots]);

  async function requestAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!service || !date || !slot || submitState === "sending") return;
    setSubmitState("sending"); setNotice("");
    try {
      const response = await fetch(`/api/appointments`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: id, appointmentDate: date, timeSlot: slot, message }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.message || "Unable to submit your appointment.");
      setSubmitState("success");
      notify.success("Appointment requested", { description: "Your request is pending review. No payment is due yet." });
      setNotice("Your appointment request was received. Status: Pending · Payment: Unpaid.");
    } catch (reason) {
      setSubmitState("idle");
      const detail = reason instanceof Error ? reason.message : "Unable to submit your appointment.";
      setNotice(detail);
      notify.error("Appointment request failed", { description: detail });
      // Refresh availability after a conflict or network error.
      setRefreshSlots((previous) => previous + 1);
    }
  }

  if (isPending) return <main className="aayna-loading-page" role="status" aria-label="Checking your account"><Skeleton shape="line" style={{ width: "35%", height: 30 }}/><ContentSkeleton rows={4} title="Checking your account" /></main>;
  if (!session?.user) return <main className="aayna-booking-gate"><p className="aayna-featured-kicker">MEMBERS ONLY</p><h1>Sign in to continue.</h1><p>Service details and appointment requests are available to AAYNA customers.</p><Link href={`/sign-in?next=${encodeURIComponent(`/services/${id}`)}`} className="aayna-booking-primary">Sign in <ArrowUpRight size={18} /></Link><Link href="/services">Browse all services</Link></main>;
  if (user?.isBlocked) return <main className="aayna-booking-gate"><h1>Account access restricted.</h1><p>Contact support for assistance.</p></main>;
  

  return <main className="aayna-booking-page">
    <Link href="/services" className="aayna-booking-back"><ArrowLeft size={17} /> All services</Link>
    {state === "loading" && <div className="aayna-loading-service" role="status" aria-label="Loading service details"><Skeleton className="aayna-loading-service-photo"/><ContentSkeleton rows={5} title="Loading service details"/></div>}
    {state === "error" && <p role="alert">Service details are temporarily unavailable. Please try again.</p>}
    {state === "missing" && <div className="aayna-booking-gate"><h1>Service unavailable.</h1><p>This service may have been removed or made inactive.</p><Link href="/services">Browse active services</Link></div>}
    {state === "ready" && service && <div className="aayna-booking-layout">
      <section className="aayna-booking-service" aria-labelledby="aayna-booking-title">
        <div className="aayna-booking-image">
          {service.image ? <img src={service.image} alt={service.serviceName} /> : <div className="aayna-booking-imageFallback">AAYNA</div>}
        </div>
        <p className="aayna-featured-kicker">{service.category}</p>
        <h1 id="aayna-booking-title">{service.serviceName}</h1>
        <p className="aayna-booking-description">{service.description}</p>
        <div className="aayna-booking-facts"><strong>{money.format(service.price)}</strong><span><Clock3 size={17} /> {service.duration} minutes</span></div>
        <div className="aayna-booking-note"><ShieldCheck size={19} /><span>Request now. Payment is available only after admin confirmation.</span></div>
      </section>
      {user?.role === "customer" ? <section className="aayna-booking-panel" aria-labelledby="aayna-booking-form-title">
        <p className="aayna-featured-kicker">YOUR APPOINTMENT</p>
        <h2 id="aayna-booking-form-title">Choose a time that works.</h2>
        <p className="aayna-booking-subtitle">Send a request. We&apos;ll update its status after review.</p>
        {submitState === "success" ? <div role="status" className="aayna-booking-success"><h3>Request submitted</h3><p>{notice}</p><Link href="/dashboard/customer">Go to dashboard <ArrowUpRight size={17}/></Link></div> :
          <form onSubmit={requestAppointment} className="aayna-booking-form">
            <label htmlFor="aayna-booking-date">Appointment date</label>
            <div className="aayna-booking-inputWrap"><CalendarDays size={18} /><input id="aayna-booking-date" type="date" required min={today()} value={date} onChange={(event) => { setDate(event.target.value); setSlot(""); setSlots([]); setSlotsState("idle"); setNotice(""); }} /></div>
            <label htmlFor="aayna-booking-slot">Available time slot <span>(Bangladesh time)</span></label>
            <select id="aayna-booking-slot" value={slot} onChange={(event) => setSlot(event.target.value)} required disabled={!date || slotsState !== "ready"}>
              <option value="">{slotsState === "loading" ? "Checking availability…" : "Select a time"}</option>
              {slots.filter((item) => item.available).map((item) => <option value={item.time} key={item.time}>{item.time}</option>)}
            </select>
            {slotsState === "ready" && <p className="aayna-booking-hint">{slots.filter((item) => item.available).length} of {slots.length} slots currently open. Final availability is verified when you submit.</p>}
            {slotsState === "error" && <p role="alert" className="aayna-booking-error">Couldn&apos;t check availability. Change the date or try again shortly.</p>}
            <label htmlFor="aayna-booking-message">Message <span>(optional)</span></label>
            <textarea id="aayna-booking-message" maxLength={500} rows={4} placeholder="Anything the salon should know?" value={message} onChange={(event) => setMessage(event.target.value)} />
            <div className="aayna-booking-total"><span>Service price</span><strong>{money.format(service.price)}</strong></div>
            {notice && <p role="alert" className="aayna-booking-error">{notice}</p>}
            <button className="aayna-booking-primary" disabled={submitState === "sending" || !slot || !date || slotsState !== "ready"} type="submit">{submitState === "sending" ? <><ActionSpinner label="Submitting appointment" /> Submitting…</> : "Request appointment"}<ArrowUpRight size={18} /></button>
            <p className="aayna-booking-hint">Your request will be Pending and Unpaid until reviewed.</p>
          </form>}
      </section> : <section className="aayna-booking-panel"><h2>Service preview</h2><p>Administrators can review service information here. Appointment booking is reserved for customers.</p></section>}
    </div>}
  </main>;
}
