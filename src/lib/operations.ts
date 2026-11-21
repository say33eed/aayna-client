import { ensureConnection } from "./connection";
import { ApiError } from "./api";
export class ConnectionUnavailable extends Error {}
export type Outcome<T> = { success: true; message: string; data: T } | { success: false; message: string };
const active = new Set<string>();
// A stable action key prevents concurrent submissions in this browser instance.
// Mutation routes must implement durable server-side idempotency before use.
export async function runOperation<T>(key: string, execute: () => Promise<Outcome<T>>, signal?: AbortSignal): Promise<Outcome<T> | undefined> {
  if (active.has(key)) return undefined;
  active.add(key);
  try {
    if (!(await ensureConnection())) throw new ConnectionUnavailable("Connection unavailable. Try again.");
    if (signal?.aborted) return undefined;
    return await execute();
  } catch (error) {
    if (error instanceof ConnectionUnavailable) throw error;
    if (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500) return { success: false, message: error.message };
    throw new Error("Unable to confirm the operation. Check its status before trying again.");
  } finally { active.delete(key); }
}
