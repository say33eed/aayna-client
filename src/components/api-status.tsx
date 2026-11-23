"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ensureConnection, subscribe, snapshot } from "@/lib/connection";

const CONNECTION_TOAST_ID = "aayna-connection-unavailable";

/** No persistent status UI: notify only when a health check fails. */
export function ApiStatus() {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    const showFailure = () => {
      if (!mounted.current) return;
      const state = snapshot();
      if (state === "ready") {
        toast.dismiss(CONNECTION_TOAST_ID);
        return;
      }
      if (state === "checking") return;
      toast.error(
        state === "database" ? "Service temporarily unavailable" : "Connection unavailable",
        {
          id: CONNECTION_TOAST_ID,
          description: "We couldn't connect to Aayna. Please try again.",
          duration: Infinity,
          action: {
            label: "Retry",
            onClick: () => {
              toast.dismiss(CONNECTION_TOAST_ID);
              void ensureConnection(true);
            },
          },
        }
      );
    };

    const unsubscribe = subscribe(showFailure);
    // Subscribe before checking so a failure cannot be missed.
    showFailure();
    void ensureConnection();

    return () => {
      mounted.current = false;
      unsubscribe();
      toast.dismiss(CONNECTION_TOAST_ID);
    };
  }, []);

  return null;
}
