
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
} from "lucide-react";
import { getApiHealth } from "@/lib/api";

type ConnectionState =
  | "checking"
  | "connected"
  | "unavailable";

export function ApiStatus() {
  const [status, setStatus] =
    useState<ConnectionState>("checking");

  const [detail, setDetail] = useState("");

  const check = useCallback(async () => {
    setStatus("checking");
    setDetail("");

    try {
      await getApiHealth();
      setStatus("connected");
    } catch (error) {
      setStatus("unavailable");
      setDetail(
        error instanceof Error
          ? error.message
          : "Unknown error.",
      );
    }
  }, []);

  useEffect(() => {
    void getApiHealth().then(
      () => setStatus("connected"),
      (error: unknown) => {
        setStatus("unavailable");
        setDetail(
          error instanceof Error
            ? error.message
            : "Unknown error.",
        );
      },
    );
  }, []);

  return (
    <section
      className="api-status"
      aria-label="API connection status"
    >
      <div className="api-status-copy">
        {status === "checking" ? (
          <LoaderCircle
            size={17}
            className="api-status-spin"
            aria-hidden="true"
          />
        ) : status === "connected" ? (
          <CheckCircle2
            size={17}
            aria-hidden="true"
          />
        ) : (
          <CircleAlert
            size={17}
            aria-hidden="true"
          />
        )}

        <div>
          <p className="api-status-heading">
            {status === "checking"
              ? "Checking API connection"
              : status === "connected"
                ? "API connected"
                : "API unavailable"}
          </p>

          <p className="api-status-detail">
            {status === "checking"
              ? "Contacting the AAYNA backend…"
              : status === "connected"
                ? "Frontend and backend are communicating."
                : detail}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="api-retry"
        onClick={() => void check()}
        disabled={status === "checking"}
      >
        <RefreshCw size={15} aria-hidden="true" />
        Retry
      </button>
    </section>
  );
}
