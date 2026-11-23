import { LoaderCircle } from "lucide-react";

/** Compact, accessible indicator for an in-progress user action. */
export function ActionSpinner({ label = "Processing", size = 17 }: { label?: string; size?: number }) {
  return <LoaderCircle className="aayna-action-spinner" size={size} aria-hidden="true" data-loading-label={label} />;
}
