"use client";
import { useSyncExternalStore } from "react";
import { subscribeFeedback, feedbackSnapshot, serverFeedback, dismissToast } from "@/lib/operations";
export function OperationFeedback() {
  const { prompts, toasts } = useSyncExternalStore(subscribeFeedback, feedbackSnapshot, serverFeedback);
  const prompt = prompts[0];
  return <>
    {prompt && <section className="operation-prompt" aria-label="Connection recovery">
      <p role="status"><strong>{prompt.phase === "connecting" ? "Connecting…" : "Connection unavailable"}</strong></p>
      <p>{prompt.phase === "connecting" ? "Preparing your request. This may take a moment." : "Reconnect to continue your request, or cancel it."}</p>
      <div className="operation-actions">{prompt.phase === "retry" && <button className="button button-primary" onClick={prompt.retry}>Try again</button>}<button className="button button-secondary" onClick={prompt.cancel}>Cancel</button></div>
    </section>}
    <div className="operation-toasts">{toasts.map(t => <div key={t.id} className="operation-toast"><div role={t.kind === "success" ? "status" : "alert"}><strong>{t.kind === "success" ? "Success" : t.kind === "error" ? "Unsuccessful" : "Outcome unconfirmed"}</strong><p>{t.message}</p></div><button className="icon-button" aria-label="Dismiss notification" onClick={() => dismissToast(t.id)}>×</button></div>)}</div>
  </>;
}
