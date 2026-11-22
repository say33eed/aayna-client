/** AAYNA launch defaults. Do not reinterpret existing BDT prices as USD. */
export const AAYNA_CURRENCY = "BDT" as const;
export const AAYNA_TIME_ZONE = "Asia/Dhaka" as const;

const priceFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency", currency: AAYNA_CURRENCY,
  minimumFractionDigits: 0, maximumFractionDigits: 2,
});
const dateFormatter = new Intl.DateTimeFormat("en-BD", {
  timeZone: AAYNA_TIME_ZONE, year: "numeric", month: "short", day: "numeric",
});

export function formatAaynaPrice(amount: number): string {
  return Number.isFinite(amount) ? priceFormatter.format(amount) : "—";
}

/** For UTC timestamps such as MongoDB createdAt, show Bangladesh local date. */
export function formatDhakaDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

/** Date-only appointment values are already salon-local YYYY-MM-DD dates. */
export function formatAppointmentDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "—";
  const date = new Date(`${value}T12:00:00+06:00`);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}
