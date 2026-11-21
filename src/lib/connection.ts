import { getApiHealth } from "./api";
export type Connection = "checking" | "ready" | "backend" | "database";
let state: Connection = "checking";
let readyAt = 0;
let pending: Promise<boolean> | undefined;
const listeners = new Set<() => void>();
export const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const snapshot = () => state;
export const serverSnapshot = (): Connection => "checking";
function publish(next: Connection) { state = next; listeners.forEach(fn => fn()); }
export function ensureConnection(force = false): Promise<boolean> {
  if (pending) return pending;
  if (!force && state === "ready" && Date.now() - readyAt < 30000) return Promise.resolve(true);
  publish("checking");
  pending = (async () => {
    const deadline = Date.now() + 120000;
    let failure: Connection = "backend";
    for (const delay of [0, 5000, 10000, 20000]) {
      if (Date.now() + delay >= deadline) break;
      if (delay) await new Promise(resolve => setTimeout(resolve, delay));
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), Math.min(60000, Math.max(1, deadline - Date.now())));
      try {
        const result = await getApiHealth(controller.signal);
        if (result.data.database === "connected") { readyAt = Date.now(); publish("ready"); return true; }
        failure = "database";
      } catch { failure = "backend"; }
      finally { clearTimeout(timer); }
    }
    publish(failure); return false;
  })().finally(() => { pending = undefined; });
  return pending;
}
