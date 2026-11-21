import { ensureConnection } from "./connection";
import { ApiError } from "./api";
export type Outcome<T> = { success: true; message: string; data: T } | { success: false; message: string };
type Prompt = { key: string; phase: "connecting" | "retry"; retry: () => void; cancel: () => void };
type Toast = { id: number; kind: "success" | "error" | "unknown"; message: string };
type Feedback = { prompts: Prompt[]; toasts: Toast[] };
const initial: Feedback = { prompts: [], toasts: [] };
let feedback = initial;
const listeners = new Set<() => void>();
export const subscribeFeedback = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const feedbackSnapshot = () => feedback;
export const serverFeedback = () => initial;
function publish(next: Feedback) { feedback = next; listeners.forEach(fn => fn()); }
let sequence = 0;
export function dismissToast(id: number) { publish({ ...feedback, toasts: feedback.toasts.filter(t => t.id !== id) }); }
function toast(kind: Toast["kind"], message: string) {
  const id = ++sequence;
  publish({ ...feedback, toasts: [...feedback.toasts, { id, kind, message }].slice(-4) });
  setTimeout(() => dismissToast(id), 8000);
}
const active = new Set<string>();
function removePrompt(key: string) { publish({ ...feedback, prompts: feedback.prompts.filter(p => p.key !== key) }); }
function waitForConnection(key: string, signal?: AbortSignal): Promise<boolean> {
  return new Promise(resolve => {
    let finished = false;
    function finish(ok: boolean) { if (finished) return; finished = true; signal?.removeEventListener("abort", cancel); removePrompt(key); resolve(ok); }
    function cancel() { finish(false); }
    function show(phase: Prompt["phase"]) { publish({ ...feedback, prompts: [...feedback.prompts.filter(p => p.key !== key), { key, phase, retry: () => attempt(true), cancel }] }); }
    function attempt(force = false) {
      if (finished) return;
      show("connecting");
      void ensureConnection(force).then(ok => { if (finished) return; if (ok) finish(true); else show("retry"); }, () => { if (!finished) show("retry"); });
    }
    if (signal?.aborted) { finish(false); return; }
    signal?.addEventListener("abort", cancel, { once: true });
    attempt();
  });
}
// Mutations require durable backend idempotency before integration.
export async function runOperation<T>(key: string, execute: () => Promise<Outcome<T>>, signal?: AbortSignal): Promise<Outcome<T> | undefined> {
  if (active.has(key)) return undefined;
  active.add(key);
  try {
    if (!(await waitForConnection(key, signal)) || signal?.aborted) return undefined;
    const result = await execute();
    if (!signal?.aborted) toast(result.success ? "success" : "error", result.message);
    return result;
  } catch (error) {
    if (signal?.aborted) return undefined;
    if (error instanceof ApiError && error.status) {
      toast("error", error.message); return { success: false, message: error.message };
    }
    toast("unknown", "Unable to confirm the operation. Check its status before trying again.");
    return undefined;
  } finally { removePrompt(key); active.delete(key); }
}
