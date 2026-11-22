import Link from "next/link";

export default function PaymentCancelPage() {
  return <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, background: "#fff", color: "#111" }}>
    <section style={{ width: "100%", maxWidth: 540, border: "1px solid #e6e6e6", borderRadius: 20, padding: "clamp(28px,5vw,48px)", fontFamily: "var(--font-nunito),sans-serif" }}>
      <p style={{ letterSpacing: ".18em", fontSize: 12, fontWeight: 800 }}>AAYNA / PAYMENT</p>
      <h1 style={{ fontSize: "clamp(30px,5vw,44px)", fontWeight: 800, margin: "20px 0 12px" }}>Checkout closed<span style={{ color: "#ff5100" }}>.</span></h1>
      <p style={{ lineHeight: 1.7, color: "#555" }}>You returned without completing this checkout. Your appointment remains available in your dashboard. Check its payment status before trying again.</p>
      <Link href="/dashboard/customer?view=appointments" style={{ display: "inline-flex", padding: "13px 22px", marginTop: 24, borderRadius: 999, background: "#111", color: "#fff", fontWeight: 800 }}>Back to my appointments</Link>
    </section>
  </main>;
}
