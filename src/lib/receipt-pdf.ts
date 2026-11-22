/** Generate a downloadable, self-contained A4 PDF receipt using verified transaction data. */
export type VerifiedReceipt = { reference: string; appointmentId: string; serviceName: string; appointmentDate: string; timeSlot: string; amount: number; currency: string; paidAt: string; paymentStatus: "paid" };
const clean = (value: string) => value.normalize("NFKD").replace(/[^\x20-\x7E]/g, "?").replace(/[\\()]/g, (c) => "\\" + c).slice(0, 130);
export function downloadReceiptPdf(receipt: VerifiedReceipt) {
  if (receipt.paymentStatus !== "paid") throw new Error("Payment is not verified.");
  const lines = [
    ["AAYNA", 24], ["PAYMENT RECEIPT", 13], ["Verified Stripe payment", 10],
    ["", 10], ["Service: " + receipt.serviceName, 12],
    ["Appointment: " + receipt.appointmentDate + " at " + receipt.timeSlot + " (Dhaka)", 11],
    ["Amount paid: " + receipt.currency.toUpperCase() + " " + receipt.amount.toFixed(2), 12],
    ["Paid on: " + (receipt.paidAt || "Verified"), 11],
    ["Status: PAID", 12], ["Appointment ID: " + receipt.appointmentId, 9],
    ["Stripe reference: " + receipt.reference, 9],
    ["", 10], ["Thank you for choosing Aayna.", 11]
  ] as const;
  let y = 778;
  const commands = lines.map(([value, size]) => { const line = `BT /F1 ${size} Tf 48 ${y} Td (${clean(value)}) Tj ET`; y -= size + 19; return line; }).join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${new TextEncoder().encode(commands).length} >>\nstream\n${commands}\nendstream`
  ];
  let output = "%PDF-1.4\n"; const offsets = [0];
  for (let i = 0; i < objects.length; i++) { offsets.push(new TextEncoder().encode(output).length); output += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`; }
  const xref = new TextEncoder().encode(output).length;
  output += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) output += `${String(offset).padStart(10, "0")} 00000 n \n`;
  output += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([output], { type: "application/pdf" }));
  const a = document.createElement("a"); a.href = url; a.download = `aayna-receipt-${receipt.appointmentId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 32)}.pdf`;
  document.body.appendChild(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}
