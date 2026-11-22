"use client";
import Link from "next/link";
import { downloadReceiptPdf } from "@/lib/receipt-pdf";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { formatAaynaPrice, formatDhakaDate } from "@/lib/locale";

type Receipt = { reference: string; appointmentId: string; serviceName: string; appointmentDate: string; timeSlot: string; amount: number; currency: string; paidAt: string; paymentStatus: "paid" };
export default function PaymentSuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => { setSessionId(new URLSearchParams(window.location.search).get("session_id") ?? ""); }, []);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(true);
  const [state, setState] = useState<"checking" | "waiting" | "error">("checking");
  useEffect(() => {
    if (sessionId === null) return;
    if (!sessionId || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) { setState("error"); return; }
    let cancelled = false;
    let tries = 0;
    const controller = new AbortController();
    async function check() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/payments/receipt/${encodeURIComponent(sessionId!)}`, { credentials: "include", cache: "no-store", signal: controller.signal });
        if (response.status === 401 || response.status === 403) { if (!cancelled) setState("error"); return; }
        const result = await response.json() as { success?: boolean; data?: Receipt };
        if (response.ok && result.success && result.data?.paymentStatus === "paid") { if (!cancelled) setReceipt(result.data); return; }
      } catch { if (cancelled) return; }
      if (cancelled) return;
      setState("waiting");
      if (++tries < 8) timeout = window.setTimeout(check, 2500);
    }
    let timeout: number | undefined;
    void check();
    return () => { cancelled = true; controller.abort(); if (timeout) window.clearTimeout(timeout); };
  }, [sessionId]);
  return <main className="aaynaReceipt_page" style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, background: "#fff", color: "#111" }}>
    <section style={{ width: "100%", maxWidth: 560, border: "1px solid #e6e6e6", borderRadius: 20, padding: "clamp(28px,5vw,48px)", fontFamily: "var(--font-nunito),sans-serif" }}>
      <p style={{ letterSpacing: ".18em", fontSize: 12, fontWeight: 800 }}>AAYNA / PAYMENT</p>
      <h1 style={{ fontSize: "clamp(30px,5vw,44px)", fontWeight: 800, margin: "20px 0 12px" }}>{receipt ? "Payment verified" : "Payment submitted"}<span style={{ color: "#ff5100" }}>.</span></h1>
      {receipt && receiptOpen ? <div id="aayna-receipt" aria-label="Payment receipt">
        <p style={{ lineHeight: 1.7 }}>Your payment is confirmed. Here is your Aayna receipt.</p>
        <dl style={{ marginTop: 20, lineHeight: 2, overflowWrap: "anywhere" }}>
          <div><dt>Service</dt><dd><strong>{receipt.serviceName}</strong></dd></div>
          <div><dt>Appointment</dt><dd>{receipt.appointmentDate} · {receipt.timeSlot} (Dhaka)</dd></div>
          <div><dt>Amount paid</dt><dd><strong>{formatAaynaPrice(receipt.amount)}</strong></dd></div>
          <div><dt>Paid on</dt><dd>{receipt.paidAt ? formatDhakaDate(receipt.paidAt) : "Verified"}</dd></div>
          <div><dt>Payment status</dt><dd>Paid</dd></div>
          <div><dt>Stripe reference</dt><dd style={{ fontSize: 12 }}>{receipt.reference}</dd></div>
        </dl>
        <div className="aaynaReceipt_actions"><button type="button" onClick={() => downloadReceiptPdf(receipt)}>Download PDF receipt</button><button type="button" onClick={() => setReceiptOpen(false)}>Close receipt</button></div>
      </div> : receipt ? <button type="button" className="aaynaReceipt_reopen" onClick={() => setReceiptOpen(true)}>View receipt</button> : <p role="status" style={{ lineHeight: 1.7, color: "#555" }}>{state === "error" ? "We could not check this payment. Sign in to the paying account and check My appointments." : "Waiting for secure payment confirmation from Stripe. Do not pay again until you have checked your appointment status."}</p>}
      <div><Link href="/dashboard/customer?view=appointments" style={{ display: "inline-flex", padding: "13px 22px", marginTop: 24, borderRadius: 999, background: receipt ? "#f2f2f2" : "#111", color: receipt ? "#111" : "#fff", fontWeight: 800 }}>View my appointments</Link></div>
    </section>
  </main>;
}
