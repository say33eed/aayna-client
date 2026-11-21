import { API_BASE_URL } from "./api";
import { ensureConnection } from "./connection";
export type Service = { _id: string; serviceName: string; category: string; description: string; price: number; duration: number; image: string };
type Entry = { savedAt: number; tag: string; rows: Service[] };
const key = `aayna:public-services:v1:${API_BASE_URL}`;
let memory: Entry | undefined;
let pending: Promise<Entry> | undefined;
export function cachedServices(): Entry | undefined {
  if (memory) return memory;
  try { const raw = localStorage.getItem(key); if (raw) { const v = JSON.parse(raw) as Entry; if (Array.isArray(v.rows) && typeof v.savedAt === "number" && typeof v.tag === "string") memory = v; } } catch { /* storage unavailable */ }
  return memory;
}
export function invalidateServices() { memory = undefined; try { localStorage.removeItem(key); } catch { /* unavailable */ } }
export function loadServices(force = false): Promise<Entry> {
  if (pending) return pending;
  const previous = cachedServices();
  if (!force && previous && Date.now() - previous.savedAt < 300000) return Promise.resolve(previous);
  pending = (async () => {
    if (!(await ensureConnection())) throw new Error("Connection unavailable. Try again.");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(`${API_BASE_URL}/api/services`, { cache: "no-store", signal: controller.signal, headers: previous?.tag ? { "If-None-Match": previous.tag } : {} });
      let entry: Entry;
      if (response.status === 304 && previous) entry = { ...previous, savedAt: Date.now() };
      else {
        const body = await response.json();
        if (!response.ok || body.success !== true || !Array.isArray(body.data)) throw new Error(typeof body.message === "string" ? body.message : "Unable to load services.");
        entry = { rows: body.data, savedAt: Date.now(), tag: response.headers.get("ETag") || "" };
      }
      memory = entry;
      try { localStorage.setItem(key, JSON.stringify(entry)); } catch { /* memory fallback */ }
      return entry;
    } finally { clearTimeout(timer); }
  })().finally(() => { pending = undefined; });
  return pending;
}
